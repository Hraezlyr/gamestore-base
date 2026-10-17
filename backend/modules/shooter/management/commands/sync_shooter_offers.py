from django.core.management.base import BaseCommand, CommandError

from modules.shooter.integrations.cheapshark import (
    CheapSharkClient,
    CheapSharkError,
)
from modules.shooter.repositories.offers import DjangoOfferRepository
from modules.shooter.services.offer_sync import sync_catalog_offers


class Command(BaseCommand):
    help = "Sincroniza ofertas de los juegos vinculados con CheapShark."

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=10)
        parser.add_argument("--after-id", type=int, default=0)

    def handle(self, *args, **options):
        try:
            result = sync_catalog_offers(
                provider=CheapSharkClient(),
                repository=DjangoOfferRepository(),
                limit=options["limit"],
                after_id=options["after_id"],
            )
        except (ValueError, CheapSharkError) as error:
            raise CommandError(str(error)) from None

        for outcome in result.outcomes:
            counts = outcome.result
            self.stdout.write(
                f"ID {outcome.local_id}: "
                f"{counts.created} creadas, "
                f"{counts.updated} actualizadas, "
                f"{counts.deactivated} desactivadas."
            )

        self.stdout.write(self.style.SUCCESS(
            f"Juegos procesados: {len(result.outcomes)}. "
            f"Ofertas creadas: {result.created}. "
            f"Actualizadas: {result.updated}. "
            f"Desactivadas: {result.deactivated}."
        ))

        if result.last_id is not None:
            self.stdout.write(
                f"Último ID procesado: {result.last_id}. "
                "Usa --after-id con ese valor para continuar."
            )