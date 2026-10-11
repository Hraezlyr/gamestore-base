from rest_framework import serializers

from shooter.models import GameOffer, ShooterGame


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
            "price",
            "retail_price",
            "currency",
            "last_synced_at",
        )
        read_only_fields = fields


class ShooterGameDetailSerializer(ShooterGameListSerializer):
    offers = GameOfferSerializer(
        source="available_offers",
        many=True,
        read_only=True,
    )

    class Meta(ShooterGameListSerializer.Meta):
        fields = ShooterGameListSerializer.Meta.fields + (
            "description",
            "offers",
        )
        read_only_fields = fields