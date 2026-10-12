from collections.abc import Sequence

from shooter.dtos import (
    CatalogLinkResult,
    GameLinkOutcome,
    GameMatchData,
    GameToLink,
    LinkStatus,
)
from shooter.ports import (
    GameLinkRepository,
    GameMatchProvider,
    SteamIdProvider,
)


def select_unique_match(
    matches: Sequence[GameMatchData],
    steam_app_id: str,
) -> GameMatchData | LinkStatus:
    if not matches:
        return LinkStatus.NO_MATCH

    if len(matches) > 1:
        return LinkStatus.AMBIGUOUS

    match = matches[0]

    if match.steam_app_id != steam_app_id:
        return LinkStatus.STEAM_ID_MISMATCH

    return match


def link_one_game(
    game: GameToLink,
    repository: GameLinkRepository,
    steam_provider: SteamIdProvider,
    match_provider: GameMatchProvider,
) -> GameLinkOutcome:
    steam_id = game.steam_app_id or steam_provider.fetch_steam_app_id(
        game.rawg_id
    )

    if not steam_id:
        return GameLinkOutcome(
            local_id=game.local_id,
            status=LinkStatus.NO_STEAM_ID,
        )

    matches = match_provider.fetch_games_by_steam_app_id(steam_id)
    selection = select_unique_match(matches, steam_id)

    if isinstance(selection, LinkStatus):
        return GameLinkOutcome(
            local_id=game.local_id,
            status=selection,
        )

    linked = repository.link(
        game_pk=game.local_id,
        steam_app_id=steam_id,
        cheapshark_id=selection.external_id,
    )

    return GameLinkOutcome(
        local_id=game.local_id,
        status=LinkStatus.LINKED if linked else LinkStatus.CONFLICT,
    )


def link_catalog(
    repository: GameLinkRepository,
    steam_provider: SteamIdProvider,
    match_provider: GameMatchProvider,
    limit: int = 10,
    after_id: int = 0,
) -> CatalogLinkResult:
    if limit < 1 or after_id < 0:
        raise ValueError(
            "El límite debe ser positivo y el ID inicial no negativo."
        )

    games = repository.get_unlinked_games(
        limit=limit,
        after_id=after_id,
    )

    outcomes = tuple(
        link_one_game(
            game=game,
            repository=repository,
            steam_provider=steam_provider,
            match_provider=match_provider,
        )
        for game in games
    )

    return CatalogLinkResult(outcomes=outcomes)