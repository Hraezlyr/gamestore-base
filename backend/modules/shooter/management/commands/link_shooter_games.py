from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from modules.shooter.domain.dtos import LinkStatus
from modules.shooter.integrations.cheapshark import (
    CheapSharkClient,
    CheapSharkError,
)
from modules.shooter.integrations.rawg import RawgClient, RawgError
from modules.shooter.repositories.game_link import DjangoGameLinkRepository
from modules.shooter.services.catalog_link import link_catalog


STATUS_MESSAGES = {
    LinkStatus.LINKED: "vinculado",
    LinkStatus.NO_STEAM_ID: "sin identificador único de Steam",
    LinkStatus.NO_MATCH: "sin candidato en CheapShark",
    LinkStatus.AMBIGUOUS: "varios candidatos en CheapShark",
    LinkStatus.STEAM_ID_MISMATCH: "identificador de Steam diferente",
    LinkStatus.CONFLICT: "conflicto con una vinculación existente",
}


class Command(BaseCommand):
    help = "Vincula juegos del catálogo con CheapShark usando Steam."

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=10)
        parser.add_argument("--after-id", type=int, default=0)

    def handle(self, *args, **options):
        try:
            result = link_catalog(
                repository=DjangoGameLinkRepository(),
                steam_provider=RawgClient(
                    api_key=settings.RAWG_API_KEY,
                ),
                match_provider=CheapSharkClient(),
                limit=options["limit"],
                after_id=options["after_id"],
            )
        except (ValueError, RawgError, CheapSharkError) as error:
            raise CommandError(str(error)) from None

        for outcome in result.outcomes:
            self.stdout.write(
                f"ID {outcome.local_id}: "
                f"{STATUS_MESSAGES[outcome.status]}."
            )

        self.stdout.write(self.style.SUCCESS(
            f"Vinculados: {result.linked}. "
            f"Omitidos: {result.skipped}."
        ))

        if result.last_id is not None:
            self.stdout.write(
                f"Último ID procesado: {result.last_id}. "
                "Usa --after-id con ese valor para continuar."
            )