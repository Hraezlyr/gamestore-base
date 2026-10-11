from enum import Enum
from decimal import Decimal

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

@dataclass(frozen=True)
class GameMatchData:
    external_id: str
    steam_app_id: str
    title: str

@dataclass(frozen=True)
class GameToLink:
    local_id: int
    rawg_id: int
    steam_app_id: str

class LinkStatus(Enum):
    LINKED = "linked"
    NO_STEAM_ID = "no_steam_id"
    NO_MATCH = "no_match"
    AMBIGUOUS = "ambiguous"
    STEAM_ID_MISMATCH = "steam_id_mismatch"
    CONFLICT = "conflict"


@dataclass(frozen=True)
class GameLinkOutcome:
    local_id: int
    status: LinkStatus


@dataclass(frozen=True)
class CatalogLinkResult:
    outcomes: tuple[GameLinkOutcome, ...]

    @property
    def linked(self) -> int:
        return sum(
            outcome.status is LinkStatus.LINKED
            for outcome in self.outcomes
        )

    @property
    def skipped(self) -> int:
        return len(self.outcomes) - self.linked

    @property
    def last_id(self) -> int | None:
        return self.outcomes[-1].local_id if self.outcomes else None

@dataclass(frozen=True)
class OfferData:
    external_id: str
    store_external_id: str
    price: Decimal
    retail_price: Decimal
    currency: str = "USD"

@dataclass(frozen=True)
class GameToSyncOffers:
    local_id: int
    cheapshark_id: str


@dataclass(frozen=True)
class OfferSyncResult:
    created: int
    updated: int
    deactivated: int

@dataclass(frozen=True)
class GameOfferSyncOutcome:
    local_id: int
    result: OfferSyncResult


@dataclass(frozen=True)
class CatalogOfferSyncResult:
    outcomes: tuple[GameOfferSyncOutcome, ...]

    @property
    def created(self) -> int:
        return sum(outcome.result.created for outcome in self.outcomes)

    @property
    def updated(self) -> int:
        return sum(outcome.result.updated for outcome in self.outcomes)

    @property
    def deactivated(self) -> int:
        return sum(
            outcome.result.deactivated
            for outcome in self.outcomes
        )

    @property
    def last_id(self) -> int | None:
        return self.outcomes[-1].local_id if self.outcomes else None