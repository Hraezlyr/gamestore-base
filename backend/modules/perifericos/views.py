
from decimal import Decimal

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import PerifericosGame
from .serializers import PerifericosGameSerializer


class PerifericosGameViewSet(viewsets.ModelViewSet):
	queryset = PerifericosGame.objects.all().order_by('-created_at')
	serializer_class = PerifericosGameSerializer

	@action(detail=True, methods=['post'], url_path='calculate-plan')
	def calculate_plan(self, request, pk=None):
		periferico = self.get_object()

		periodicity = request.data.get('periodicity')

		try:
			periodicity = int(periodicity)
		except (TypeError, ValueError):
			return Response(
				{'error': 'La periodicidad debe ser 1, 3 o 12 meses.'},
				status=status.HTTP_400_BAD_REQUEST
			)

		discounts = {
			1: Decimal('0.00'),
			3: Decimal('0.05'),
			12: Decimal('0.15')
		}

		if periodicity not in discounts:
			return Response(
				{'error': 'La periodicidad permitida es 1, 3 o 12 meses.'},
				status=status.HTTP_400_BAD_REQUEST
			)

		monthly_price = periferico.price
		subtotal = monthly_price * periodicity
		discount_rate = discounts[periodicity]
		savings = (subtotal * discount_rate).quantize(Decimal('0.01'))
		final_price = subtotal - savings

		return Response({
			'product_id': periferico.id,
			'title': periferico.title,
			'periodicity': periodicity,
			'monthly_price': str(monthly_price),
			'subtotal': str(subtotal),
			'discount_percentage': int(discount_rate * 100),
			'savings': str(savings),
			'final_price': str(final_price)
		}, status=status.HTTP_200_OK)
