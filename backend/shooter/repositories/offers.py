from collections.abc import Sequence
from datetime import datetime

from django.db import transaction
from django.utils import timezone

from shooter.dtos import OfferData, OfferSyncResult, GameToSyncOffers
from shooter.models import GameOffer, Store, ShooterGame


class DjangoOfferRepository:
    def get_linked_games(
        self,
        limit: int,
        after_id: int,
    ) -> tuple[GameToSyncOffers, ...]:
        games = (
            ShooterGame.objects
            .filter(
                cheapshark_id__isnull=False,
                pk__gt=after_id,
            )
            .exclude(cheapshark_id="")
            .order_by("pk")[:limit]
        )

        return tuple(
            GameToSyncOffers(
                local_id=game.pk,
                cheapshark_id=game.cheapshark_id,
            )
            for game in games
        )

    @transaction.atomic
    def sync_offers(
        self,
        game_pk: int,
        offers: Sequence[OfferData],
    ) -> OfferSyncResult:
        game = ShooterGame.objects.select_for_update().get(pk=game_pk)
        offer_ids = [offer.external_id for offer in offers]

        if len(offer_ids) != len(set(offer_ids)):
            raise ValueError("La lista contiene ofertas duplicadas.")

        stores = self._resolve_stores(offers)
        synced_at = timezone.now()
        created = 0
        updated = 0

        for offer in offers:
            was_created = self._save_offer(
                game=game,
                store=stores[offer.store_external_id],
                offer=offer,
                synced_at=synced_at,
            )
            created += int(was_created)
            updated += int(not was_created)

        deactivated = (
            GameOffer.objects
            .filter(game=game, is_active=True)
            .exclude(cheapshark_deal_id__in=offer_ids)
            .update(is_active=False)
        )

        return OfferSyncResult(
            created=created,
            updated=updated,
            deactivated=deactivated,
        )

    @staticmethod
    def _resolve_stores(
        offers: Sequence[OfferData],
    ) -> dict[str, Store]:
        store_ids = {offer.store_external_id for offer in offers}
        stores = {
            store.cheapshark_id: store
            for store in Store.objects.filter(
                cheapshark_id__in=store_ids,
            )
        }

        missing_ids = store_ids - stores.keys()
        if missing_ids:
            raise ValueError(
                f"Tiendas sin sincronizar: {', '.join(sorted(missing_ids))}."
            )

        return stores

    @staticmethod
    def _save_offer(
        game: ShooterGame,
        store: Store,
        offer: OfferData,
        synced_at: datetime
    ) -> bool:
        values = {
            "price": offer.price,
            "retail_price": offer.retail_price,
            "currency": offer.currency,
            "last_synced_at": synced_at,
            "is_active": True,
        }

        record, created = (
            GameOffer.objects.select_for_update().get_or_create(
                cheapshark_deal_id=offer.external_id,
                defaults={
                    "game": game,
                    "store": store,
                    **values,
                },
            )
        )

        if created:
            return True

        if record.game_id != game.pk or record.store_id != store.pk:
            raise ValueError(
                f"La oferta {offer.external_id} pertenece "
                "a otro juego o tienda."
            )

        for field, value in values.items():
            setattr(record, field, value)

        record.save(update_fields=list(values))
        return False