from decimal import Decimal

from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import GiftCard, GiftCardCode


@override_settings(ROOT_URLCONF='modules.giftcards.test_urls')
class GiftCardRedeemTests(APITestCase):
    def setUp(self):
        self.coupon = GiftCardCode.objects.create(code='ABCD-1234', amount=Decimal('25.00'))
        self.url = reverse('giftcards-redeem-code')

    def test_catalogo_status_200(self):
        GiftCard.objects.create(title='Tarjeta 25', price=25, stock=10)
        response = self.client.get(reverse('giftcards-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_redeem_valid_code_happy_path(self):
        response = self.client.post(self.url, {'code': 'abcd-1234'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['credited_amount'], '25.00')
        self.coupon.refresh_from_db()
        self.assertTrue(self.coupon.is_redeemed)
        self.assertIsNotNone(self.coupon.redeemed_at)

    def test_redeem_same_code_twice_is_rejected(self):
        self.client.post(self.url, {'code': 'ABCD-1234'}, format='json')
        response = self.client.post(self.url, {'code': 'ABCD-1234'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(GiftCardCode.objects.filter(is_redeemed=True).count(), 1)

    def test_redeem_invalid_format_returns_400_without_changes(self):
        response = self.client.post(self.url, {'code': 'XX'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.coupon.refresh_from_db()
        self.assertFalse(self.coupon.is_redeemed)

    def test_redeem_missing_code_returns_400(self):
        response = self.client.post(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_redeem_unknown_code_returns_404(self):
        response = self.client.post(self.url, {'code': 'ZZZZ-9999'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
