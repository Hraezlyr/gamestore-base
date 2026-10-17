from collections.abc import Iterable

from django.db import transaction

from modules.shooter.domain.dtos import GameData, GameSyncResult
from modules.shooter.models import ShooterGame
from modules.shooter.services.screenshot_sync import sync_screenshots


@transaction.atomic
def sync_games(games: Iterable[GameData]) -> GameSyncResult:
    created_count = 0
    updated_count = 0

    for game in games:
        local_game, created = ShooterGame.objects.update_or_create(
            rawg_id=game.external_id,
            defaults={
                "title": game.title,
                "image_url": game.image_url,
            },
        )

        if game.screenshots is not None:
            sync_screenshots(local_game, game.screenshots)

        if created:
            created_count += 1
        else:
            updated_count += 1

    return GameSyncResult(
        created=created_count,
        updated=updated_count,
    )
