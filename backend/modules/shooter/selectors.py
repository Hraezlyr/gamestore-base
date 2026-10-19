from django.db.models import Min, Prefetch, Q, QuerySet

from modules.shooter.models import GameOffer, ShooterGame


def available_offers() -> QuerySet[GameOffer]:
    return GameOffer.objects.filter(
        is_active=True,
        store__is_active=True,
        currency="USD",
    )


def public_catalog() -> QuerySet[ShooterGame]:
    return (
        ShooterGame.objects
        .annotate(
            lowest_price=Min(
                "offers__price",
                filter=Q(
                    offers__pk__in=available_offers().values("pk"),
                ),
            ),
        )
        .filter(lowest_price__isnull=False)
        .order_by("title", "pk")
    )


def public_game_details() -> QuerySet[ShooterGame]:
    return public_catalog().prefetch_related(
        "screenshots",
        Prefetch(
            "offers",
            queryset=(
                available_offers()
                .select_related("store")
                .order_by("price", "pk")
            ),
            to_attr="available_offers",
        ),
    )
