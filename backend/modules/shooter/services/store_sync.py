from collections.abc import Iterable

from django.db import transaction

from modules.shooter.models import Store
from modules.shooter.domain.dtos import StoreData, StoreSyncResult


@transaction.atomic
def sync_stores(stores: Iterable[StoreData]) -> StoreSyncResult:
    created_count = 0
    updated_count = 0

    for store in stores:
        defaults = {"name": store.name, "is_active": store.is_active}
        if store.icon_url is not None:
            defaults["icon_url"] = store.icon_url
        _, created = Store.objects.update_or_create(
            cheapshark_id=store.external_id,
            defaults=defaults,
        )

        if created:
            created_count += 1
        else:
            updated_count += 1

    return StoreSyncResult(
        created=created_count,
        updated=updated_count,
    )
