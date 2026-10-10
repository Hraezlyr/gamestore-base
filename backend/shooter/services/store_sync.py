from collections.abc import Iterable

from django.db import transaction

from shooter.models import Store
from shooter.dtos import StoreData, StoreSyncResult


@transaction.atomic
def sync_stores(stores: Iterable[StoreData]) -> StoreSyncResult:
    created_count = 0
    updated_count = 0

    for store in stores:
        _, created = Store.objects.update_or_create(
            cheapshark_id=store.external_id,
            defaults={
                "name": store.name,
                "is_active": store.is_active,
            },
        )

        if created:
            created_count += 1
        else:
            updated_count += 1

    return StoreSyncResult(
        created=created_count,
        updated=updated_count,
    )