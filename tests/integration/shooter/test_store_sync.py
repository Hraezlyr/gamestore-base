from django.test import TestCase

from shooter.dtos import StoreData
from shooter.models import Store
from shooter.services.store_sync import sync_stores


class StoreSyncTests(TestCase):
    def test_creates_stores(self):
        stores = [
            StoreData(
                external_id="1",
                name="Steam",
                is_active=True,
            ),
            StoreData(
                external_id="4",
                name="Amazon",
                is_active=False,
            ),
        ]

        result = sync_stores(stores)

        self.assertEqual(result.created, 2)
        self.assertEqual(result.updated, 0)
        self.assertEqual(Store.objects.count(), 2)

        steam = Store.objects.get(cheapshark_id="1")
        self.assertEqual(steam.name, "Steam")
        self.assertTrue(steam.is_active)

        amazon = Store.objects.get(cheapshark_id="4")
        self.assertFalse(amazon.is_active)

    def test_updates_existing_store_without_duplicates(self):
        store = Store.objects.create(
            cheapshark_id="1",
            name="Nombre anterior",
            is_active=False,
        )

        result = sync_stores([
            StoreData(
                external_id="1",
                name="Steam",
                is_active=True,
            ),
        ])

        store.refresh_from_db()

        self.assertEqual(result.created, 0)
        self.assertEqual(result.updated, 1)
        self.assertEqual(Store.objects.count(), 1)
        self.assertEqual(store.name, "Steam")
        self.assertTrue(store.is_active)