from modules.shooter.domain.dtos import (
    CatalogOfferSyncResult,
    GameOfferSyncOutcome,
    GameToSyncOffers,
    OfferSyncResult,
)
from modules.shooter.domain.ports import OfferProvider, OfferRepository


def sync_game_offers(
    game: GameToSyncOffers,
    provider: OfferProvider,
    repository: OfferRepository,
) -> OfferSyncResult:
    offers = provider.fetch_game_offers(game.cheapshark_id)

    return repository.sync_offers(
        game_pk=game.local_id,
        offers=offers,
    )

def sync_catalog_offers(
    provider: OfferProvider,
    repository: OfferRepository,
    limit: int = 10,
    after_id: int = 0,
) -> CatalogOfferSyncResult:
    if limit < 1 or after_id < 0:
        raise ValueError(
            "El límite debe ser positivo y el ID inicial no negativo."
        )

    games = repository.get_linked_games(
        limit=limit,
        after_id=after_id,
    )

    outcomes = tuple(
        GameOfferSyncOutcome(
            local_id=game.local_id,
            result=sync_game_offers(
                game=game,
                provider=provider,
                repository=repository,
            ),
        )
        for game in games
    )

    return CatalogOfferSyncResult(outcomes=outcomes)