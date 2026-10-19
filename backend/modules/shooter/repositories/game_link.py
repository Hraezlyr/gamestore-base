from django.db import transaction

from modules.shooter.domain.dtos import GameToLink
from modules.shooter.models import ShooterGame


class DjangoGameLinkRepository:
    def get_unlinked_games(
        self,
        limit: int,
        after_id: int,
    ) -> tuple[GameToLink, ...]:
        games = ShooterGame.objects.filter(
            rawg_id__isnull=False,
            cheapshark_id__isnull=True,
            pk__gt=after_id,
        ).order_by("pk")[:limit]

        return tuple(
            GameToLink(
                local_id=game.pk,
                rawg_id=game.rawg_id,
                steam_app_id=game.steam_app_id,
            )
            for game in games
        )

    @transaction.atomic
    def link(
        self,
        game_pk: int,
        steam_app_id: str,
        cheapshark_id: str,
    ) -> bool:
        game = ShooterGame.objects.select_for_update().get(pk=game_pk)

        if game.steam_app_id and game.steam_app_id != steam_app_id:
            return False

        if (
            game.cheapshark_id is not None
            and game.cheapshark_id != cheapshark_id
        ):
            return False

        already_linked = ShooterGame.objects.filter(
            cheapshark_id=cheapshark_id,
        ).exclude(pk=game.pk).exists()

        if already_linked:
            return False

        game.steam_app_id = steam_app_id
        game.cheapshark_id = cheapshark_id
        game.save(update_fields=[
            "steam_app_id",
            "cheapshark_id",
            "updated_at",
        ])

        return True