from django.db import transaction
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import GiftCard, GiftCardCode
from .serializers import GiftCardSerializer, RedeemCodeSerializer


class GiftCardViewSet(viewsets.ModelViewSet):
    queryset = GiftCard.objects.all().order_by('-created_at')
    serializer_class = GiftCardSerializer

    # POST /api/v1/giftcards/redeem-code/
    @action(detail=False, methods=['post'], url_path='redeem-code')
    def redeem_code(self, request):
        serializer = RedeemCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.validated_data['code']

        with transaction.atomic():
            coupon = GiftCardCode.objects.select_for_update().filter(code=code).first()
            if coupon is None:
                return Response(
                    {'detail': 'El código no existe.'},
                    status=status.HTTP_404_NOT_FOUND,
                )
            if coupon.is_redeemed:
                return Response(
                    {'detail': 'Este código ya fue canjeado.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            coupon.is_redeemed = True
            coupon.redeemed_at = timezone.now()
            coupon.save(update_fields=['is_redeemed', 'redeemed_at'])

        return Response(
            {
                'code': coupon.code,
                'credited_amount': str(coupon.amount),
                'redeemed_at': coupon.redeemed_at,
                'message': f'Se acreditaron {coupon.amount} a tu saldo.',
            },
            status=status.HTTP_200_OK,
        )
