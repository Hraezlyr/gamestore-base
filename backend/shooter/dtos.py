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