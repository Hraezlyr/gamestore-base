from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from shooter.integrations.rawg import RawgClient, RawgError
from shooter.services.game_sync import sync_games


class Command(BaseCommand):
    help = "Importa juegos Shooter de PC desde RAWG."

    def add_arguments(self, parser):
        parser.add_argument(
            "--max-pages",
            type=int,
            default=1,
            help="Máximo de páginas a importar, con 20 juegos por página.",
        )

    def handle(self, *args, **options):
        max_pages = options["max_pages"]

        if max_pages < 1:
            raise CommandError("--max-pages debe ser mayor que cero.")

        created_count = 0
        updated_count = 0

        try:
            client = RawgClient(api_key=settings.RAWG_API_KEY)

            for page_number in range(1, max_pages + 1):
                page = client.fetch_shooter_games(
                    page=page_number,
                    page_size=20,
                )
                result = sync_games(page.games)

                created_count += result.created
                updated_count += result.updated

                self.stdout.write(
                    f"Página {page_number}: "
                    f"{result.created} creados, "
                    f"{result.updated} actualizados."
                )

                if not page.has_next:
                    break

        except RawgError as error:
            raise CommandError(str(error)) from None

        self.stdout.write(self.style.SUCCESS(
            f"Total: {created_count} creados, "
            f"{updated_count} actualizados."
        ))

        if page.has_next:
            self.stdout.write(self.style.WARNING(
                "Quedan páginas disponibles; se alcanzó --max-pages."
            ))