from django.core.management.base import BaseCommand, CommandError

from shooter.integrations.cheapshark import (
    CheapSharkClient,
    CheapSharkError,
)
from shooter.services.store_sync import sync_stores


class Command(BaseCommand):
    help = "Importa y actualiza las tiendas desde CheapShark."

    def handle(self, *args, **options):
        client = CheapSharkClient()

        try:
            stores = client.fetch_stores()
        except CheapSharkError as error:
            raise CommandError(str(error)) from error

        result = sync_stores(stores)

        self.stdout.write(self.style.SUCCESS(
            f"Tiendas creadas: {result.created}. "
            f"Tiendas actualizadas: {result.updated}."
        ))