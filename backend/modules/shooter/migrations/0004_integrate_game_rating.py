"""Own ratings in shooter while preserving the existing reviews and table."""

import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


def ensure_rating_table(apps, schema_editor):
    model = apps.get_model("shooter", "GameRating")
    connection = schema_editor.connection
    if model._meta.db_table not in connection.introspection.table_names():
        schema_editor.create_model(model)
        return

    # Adopt only the complete schema from the former ratings app.
    with connection.cursor() as cursor:
        columns = {
            column.name for column in connection.introspection.get_table_description(
                cursor, model._meta.db_table,
            )
        }
        constraints = connection.introspection.get_constraints(cursor, model._meta.db_table)
    if not {field.column for field in model._meta.local_fields}.issubset(columns):
        raise RuntimeError("The existing ratings table is incomplete; no reviews were changed.")
    if not {constraint.name for constraint in model._meta.constraints}.issubset(constraints):
        raise RuntimeError("The existing ratings constraints are incomplete; no reviews were changed.")


def move_rating_content_type(apps, schema_editor):
    content_types = apps.get_model("contenttypes", "ContentType").objects.using(
        schema_editor.connection.alias,
    )
    old = content_types.filter(app_label="shooter_sprint2", model="gamerating").first()
    if old is None:
        return
    target = content_types.filter(app_label="shooter", model="gamerating").first()
    if target is None:
        old.app_label = "shooter"
        old.save(using=schema_editor.connection.alias, update_fields=["app_label"])
        return

    alias = schema_editor.connection.alias
    permission_model = apps.get_model("auth", "Permission")
    user_model = apps.get_model(*settings.AUTH_USER_MODEL.split("."))
    group_model = apps.get_model("auth", "Group")
    for permission in permission_model.objects.using(alias).filter(content_type_id=old.pk):
        replacement = permission_model.objects.using(alias).filter(
            content_type_id=target.pk, codename=permission.codename,
        ).first()
        if replacement is None:
            permission.content_type_id = target.pk
            permission.save(using=alias, update_fields=["content_type"])
            continue
        for user in user_model.objects.using(alias).filter(user_permissions=permission):
            user.user_permissions.add(replacement)
        for group in group_model.objects.using(alias).filter(permissions=permission):
            group.permissions.add(replacement)
        permission.delete(using=alias)
    # Retain the old content type for any historical generic references.


class Migration(migrations.Migration):
    dependencies = [
        ("shooter", "0003_store_icon_url_gamescreenshot"),
        ("contenttypes", "0002_remove_content_type_name"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(state_operations=[
            migrations.CreateModel(
                name="GameRating",
                fields=[
                    ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                    ("score", models.PositiveSmallIntegerField(validators=[
                        django.core.validators.MinValueValidator(1),
                        django.core.validators.MaxValueValidator(5),
                    ])),
                    ("comment", models.TextField(max_length=2000)),
                    ("created_at", models.DateTimeField(auto_now_add=True)),
                    ("game", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="ratings", to="shooter.shootergame")),
                    ("user", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="shooter_ratings", to=settings.AUTH_USER_MODEL)),
                ],
                options={
                    "db_table": "shooter_sprint2_gamerating",
                    "ordering": ["-created_at", "-id"],
                    "constraints": [
                        models.UniqueConstraint(fields=("game", "user"), name="shooter_sprint2_one_rating_per_user"),
                        models.CheckConstraint(condition=models.Q(score__gte=1, score__lte=5), name="shooter_sprint2_rating_score_range"),
                    ],
                },
            ),
        ]),
        # Deliberately irreversible: rolling this back must not drop adopted data.
        migrations.RunPython(ensure_rating_table),
        migrations.RunPython(move_rating_content_type, migrations.RunPython.noop),
    ]
