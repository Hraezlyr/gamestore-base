from dataclasses import dataclass


@dataclass(frozen=True)
class StoreData:
    external_id: str
    name: str
    is_active: bool


@dataclass(frozen=True)
class StoreSyncResult:
    created: int
    updated: int

@dataclass(frozen=True)
class GameData:
    external_id: int
    title: str
    image_url: str


@dataclass(frozen=True)
class GamePage:
    games: tuple[GameData, ...]
    has_next: bool

@dataclass(frozen=True)
class GameSyncResult:
    created: int
    updated: int