from collections.abc import Sequence
from typing import Protocol

from shooter.dtos import GameMatchData, GameToLink


class SteamIdProvider(Protocol):
    def fetch_steam_app_id(self, game_id: int) -> str | None:
        ...


class GameMatchProvider(Protocol):
    def fetch_games_by_steam_app_id(
        self,
        steam_app_id: str,
    ) -> Sequence[GameMatchData]:
        ...


class GameLinkRepository(Protocol):
    def get_unlinked_games(
        self,
        limit: int,
        after_id: int,
    ) -> Sequence[GameToLink]:
        ...

    def link(
        self,
        game_pk: int,
        steam_app_id: str,
        cheapshark_id: str,
    ) -> bool:
        ...