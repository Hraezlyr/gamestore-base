from django.contrib import admin

from .models import GiftCard, GiftCardCode


@admin.register(GiftCard)
class GiftCardAdmin(admin.ModelAdmin):
    list_display = ('title', 'price', 'stock')


@admin.register(GiftCardCode)
class GiftCardCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'amount', 'is_redeemed', 'redeemed_at')
    list_filter = ('is_redeemed',)
