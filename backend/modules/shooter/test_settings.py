"""Run the module tests without changing the shared project configuration."""

from core.settings import *  # noqa: F403
from core.settings import INSTALLED_APPS as PROJECT_APPS

INSTALLED_APPS = [
    "modules.shooter.apps.ShooterConfig" if app == "shooter.apps.ShooterConfig" else app
    for app in PROJECT_APPS
]
ROOT_URLCONF = "modules.shooter.root_urls"
