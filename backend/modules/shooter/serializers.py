from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.core.exceptions import ValidationError
from django.utils.translation import override
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from modules.shooter.models import GameOffer, GameRating, GameScreenshot, ShooterGame
from modules.shooter.api.links import cheapshark_deal_url


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


class GameRatingSerializer(serializers.ModelSerializer):
    score = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(max_length=2000, allow_blank=False)

    class Meta:
        model = GameRating
        fields = ("id", "score", "comment", "created_at")
        read_only_fields = ("id", "created_at")


class PublicReviewSerializer(GameRatingSerializer):
    author = serializers.SerializerMethodField()

    def get_author(self, rating):
        return rating.user.get_username() if rating.user else "Usuario anónimo"

    class Meta(GameRatingSerializer.Meta):
        fields = (*GameRatingSerializer.Meta.fields, "author")
        read_only_fields = fields


class RegistrationSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, validators=[
        UnicodeUsernameValidator(message="Usa letras, números o los caracteres @ . + - _."),
        UniqueValidator(queryset=get_user_model().objects.all(), message="Este usuario ya existe."),
    ])
    password = serializers.CharField(write_only=True, trim_whitespace=False, max_length=128)
    password_confirm = serializers.CharField(write_only=True, trim_whitespace=False, max_length=128)

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": ["Las contraseñas no coinciden."]})
        candidate = get_user_model()(username=attrs["username"])
        try:
            with override("es"):
                validate_password(attrs["password"], user=candidate)
        except ValidationError as error:
            raise serializers.ValidationError({"password": error.messages}) from error
        return attrs

    def create(self, validated_data):
        return get_user_model().objects.create_user(
            username=validated_data["username"], password=validated_data["password"],
        )
