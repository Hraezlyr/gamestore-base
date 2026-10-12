from rest_framework import serializers

from shooter.models import GameOffer, GameScreenshot, ShooterGame
from shooter.links import cheapshark_deal_url


class ShooterGameListSerializer(serializers.ModelSerializer):
    lowest_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )
    currency = serializers.SerializerMethodField()

    class Meta:
        model = ShooterGame
        fields = (
            "id",
            "title",
            "image_url",
            "lowest_price",
            "currency",
        )
        read_only_fields = fields

    def get_currency(self, obj):
        return "USD"

class GameOfferSerializer(serializers.ModelSerializer):
    store_icon_url = serializers.URLField(source="store.icon_url", read_only=True)
    purchase_url = serializers.SerializerMethodField()
    store_id = serializers.IntegerField(read_only=True)
    store_name = serializers.CharField(
        source="store.name",
        read_only=True,
    )

    class Meta:
        model = GameOffer
        fields = (
            "id",
            "store_id",
            "store_name",
            "store_icon_url",
            "price",
            "retail_price",
            "currency",
            "last_synced_at",
            "purchase_url",
        )
        read_only_fields = fields

    def get_purchase_url(self, obj):
        return cheapshark_deal_url(obj.cheapshark_deal_id)


class GameScreenshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameScreenshot
        fields = ("id", "image_url")
        read_only_fields = fields


class ShooterGameDetailSerializer(ShooterGameListSerializer):
    screenshots = GameScreenshotSerializer(many=True, read_only=True)
    offers = GameOfferSerializer(
        source="available_offers",
        many=True,
        read_only=True,
    )

    class Meta(ShooterGameListSerializer.Meta):
        fields = ShooterGameListSerializer.Meta.fields + (
            "description",
            "screenshots",
            "offers",
        )
        read_only_fields = fields

class ShooterGameAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShooterGame
        fields = (
            "id",
            "title",
            "description",
            "image_url",
            "rawg_id",
            "cheapshark_id",
            "steam_app_id",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "rawg_id",
            "cheapshark_id",
            "steam_app_id",
            "created_at",
            "updated_at",
        )
