from collections.abc import Iterable

from django.db import transaction

from shooter.dtos import ScreenshotData
from shooter.models import GameScreenshot, ShooterGame


@transaction.atomic
def sync_screenshots(game: ShooterGame, screenshots: Iterable[ScreenshotData]) -> None:
    """Replace one game's screenshot snapshot, keeping existing row identities."""
    imported_ids = []
    for position, screenshot in enumerate(screenshots):
        GameScreenshot.objects.update_or_create(
            game=game,
            rawg_id=screenshot.external_id,
            defaults={"image_url": screenshot.image_url, "position": position},
        )
        imported_ids.append(screenshot.external_id)
    game.screenshots.exclude(rawg_id__in=imported_ids).delete()
