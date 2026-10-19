from django.apps import AppConfig


class ShooterConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "modules.shooter"
    # Preserve existing table names, permissions and migration records.
    label = "shooter"
    verbose_name = "Shooters"
