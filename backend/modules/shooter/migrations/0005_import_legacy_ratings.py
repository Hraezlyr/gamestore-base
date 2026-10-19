"""Preserve any reviews from the earliest catalog implementation."""

from django.core.management.color import no_style
from django.db import migrations


def import_legacy_ratings(apps, schema_editor):
    connection = schema_editor.connection
    if "shooter_gamerating" not in connection.introspection.table_names():
        return

    rating_model = apps.get_model("shooter", "GameRating")
    ratings = rating_model.objects.using(connection.alias)
    with connection.cursor() as cursor:
        cursor.execute("SELECT id, game_id, score, comment, created_at FROM shooter_gamerating")
        rows = cursor.fetchall()

    for legacy_id, game_id, score, comment, created_at in rows:
        _, created = ratings.get_or_create(
            pk=legacy_id,
            defaults={"game_id": game_id, "score": score, "comment": comment},
        )
        if created:
            ratings.filter(pk=legacy_id).update(created_at=created_at)

    # Explicit legacy IDs must not collide with later PostgreSQL inserts.
    for sql in connection.ops.sequence_reset_sql(no_style(), [rating_model]):
        schema_editor.execute(sql)


def retire_legacy_ratings(apps, schema_editor):
    connection = schema_editor.connection
    if "shooter_gamerating" not in connection.introspection.table_names():
        return
    rating_model = apps.get_model("shooter", "GameRating")
    with connection.cursor() as cursor:
        cursor.execute("SELECT id, game_id, score, comment FROM shooter_gamerating")
        rows = cursor.fetchall()
    for legacy_id, game_id, score, comment in rows:
        if not rating_model.objects.using(connection.alias).filter(
            pk=legacy_id, game_id=game_id, score=score, comment=comment,
        ).exists():
            raise RuntimeError("A legacy review was not copied; its table has been preserved.")
    # An unmanaged legacy FK would otherwise block deletion of rated games.
    schema_editor.execute("DROP TABLE shooter_gamerating")


class Migration(migrations.Migration):
    dependencies = [("shooter", "0004_integrate_game_rating")]
    operations = [
        migrations.RunPython(import_legacy_ratings, migrations.RunPython.noop),
        migrations.RunPython(retire_legacy_ratings, migrations.RunPython.noop),
    ]
