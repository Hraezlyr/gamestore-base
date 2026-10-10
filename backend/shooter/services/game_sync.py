from collections.abc import Iterable

from django.db import transaction

from shooter.dtos import GameData, GameSyncResult
from shooter.models import ShooterGame


@transaction.atomic
def sync_games(games: Iterable[GameData]) -> GameSyncResult:
    created_count = 0
    updated_count = 0

    for game in games:
        _, created = ShooterGame.objects.update_or_create(
            rawg_id=game.external_id,
            defaults={
                "title": game.title,
                "image_url": game.image_url,
            },
        )

        if created:
            created_count += 1
        else:
            updated_count += 1

    return GameSyncResult(
        created=created_count,
        updated=updated_count,
    )