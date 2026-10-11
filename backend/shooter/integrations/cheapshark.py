import json
from decimal import Decimal, InvalidOperation
from urllib.error import URLError
from urllib.request import Request, urlopen
from urllib.parse import urlencode

from shooter.dtos import StoreData, GameMatchData, OfferData


class CheapSharkError(Exception):
    """Error al consultar o interpretar los datos de CheapShark."""


class CheapSharkClient:
    BASE_URL = "https://www.cheapshark.com/api/1.0"

    def __init__(self, timeout=15):
        self.timeout = timeout

    def fetch_stores(self):
        payload = self._get_json("stores")

        if not isinstance(payload, list):
            raise CheapSharkError(
                "La API no devolvió una lista de tiendas."
            )

        return [self._parse_store(item) for item in payload]

    @staticmethod
    def _parse_store(item):
        if not isinstance(item, dict):
            raise CheapSharkError("La tienda no es un objeto.")

        store_id = item.get("storeID")
        name = item.get("storeName")
        active = item.get("isActive")

        if (
            not isinstance(store_id, str)
            or not store_id.strip()
            or len(store_id) > 20
        ):
            raise CheapSharkError("Identificador de tienda inválido.")

        if (
            not isinstance(name, str)
            or not name.strip()
            or len(name) > 120
        ):
            raise CheapSharkError(
                f"Nombre inválido para la tienda {store_id}."
            )

        if str(active) not in {"0", "1"}:
            raise CheapSharkError(
                f"Estado inválido para la tienda {store_id}."
            )

        return StoreData(
            external_id=store_id,
            name=name,
            is_active=str(active) == "1",
        )

    def fetch_games_by_steam_app_id(
        self,
        steam_app_id: str,
    ) -> tuple[GameMatchData, ...]:
        if (
            not isinstance(steam_app_id, str)
            or not steam_app_id.isascii()
            or not steam_app_id.isdigit()
            or len(steam_app_id) > 20
            or int(steam_app_id) <= 0
        ):
            raise CheapSharkError("Steam App ID inválido.")

        payload = self._get_json(
            "games",
            params={
                "steamAppID": steam_app_id,
                "limit": 60,
            },
        )

        if not isinstance(payload, list):
            raise CheapSharkError(
                "La API no devolvió una lista de juegos."
            )

        matches = tuple(self._parse_game_match(item) for item in payload)

        if any(match.steam_app_id != steam_app_id for match in matches):
            raise CheapSharkError(
                "La respuesta contiene un Steam App ID diferente."
            )

        return matches

    @staticmethod
    def _parse_game_match(item):
        if not isinstance(item, dict):
            raise CheapSharkError("El candidato no es un objeto.")

        game_id = item.get("gameID")
        title = item.get("external")
        steam_app_id = item.get("steamAppID")

        if (
            not isinstance(game_id, str)
            or not game_id.isascii()
            or not game_id.isdigit()
            or len(game_id) > 20
            or int(game_id) <= 0
        ):
            raise CheapSharkError("Identificador de CheapShark inválido.")

        if (
            not isinstance(title, str)
            or not title.strip()
            or len(title) > 255
        ):
            raise CheapSharkError("Título del candidato inválido.")

        if not isinstance(steam_app_id, str):
            raise CheapSharkError("Steam App ID del candidato inválido.")

        return GameMatchData(
            external_id=game_id,
            steam_app_id=steam_app_id,
            title=title,
        )

    def fetch_game_offers(self, game_id: str) -> tuple[OfferData, ...]:
        if (
            not isinstance(game_id, str)
            or not game_id.isascii()
            or not game_id.isdigit()
            or len(game_id) > 20
            or int(game_id) <= 0
        ):
            raise CheapSharkError("Identificador de juego inválido.")

        payload = self._get_json("games", params={"id": game_id})

        if not isinstance(payload, dict):
            raise CheapSharkError("Respuesta de ofertas inválida.")

        deals = payload.get("deals")

        if not isinstance(deals, list):
            raise CheapSharkError("La respuesta no contiene ofertas.")

        offers = tuple(self._parse_offer(item) for item in deals)
        offer_ids = {offer.external_id for offer in offers}

        if len(offer_ids) != len(offers):
            raise CheapSharkError("La respuesta contiene ofertas duplicadas.")

        return offers

    @staticmethod
    def _parse_offer(item) -> OfferData:
        if not isinstance(item, dict):
            raise CheapSharkError("La oferta no es un objeto.")

        deal_id = item.get("dealID")
        store_id = item.get("storeID")

        if (
            not isinstance(deal_id, str)
            or not deal_id.strip()
            or len(deal_id) > 255
        ):
            raise CheapSharkError("Identificador de oferta inválido.")

        if (
            not isinstance(store_id, str)
            or not store_id.isascii()
            or not store_id.isdigit()
            or len(store_id) > 20
            or int(store_id) <= 0
        ):
            raise CheapSharkError("Identificador de tienda inválido.")

        return OfferData(
            external_id=deal_id,
            store_external_id=store_id,
            price=CheapSharkClient._parse_price(
                item.get("price"), "price"
            ),
            retail_price=CheapSharkClient._parse_price(
                item.get("retailPrice"), "retailPrice"
            ),
        )

    @staticmethod
    def _parse_price(value, field_name: str) -> Decimal:
        if not isinstance(value, str):
            raise CheapSharkError(f"Precio inválido: {field_name}.")

        try:
            amount = Decimal(value)
        except InvalidOperation:
            raise CheapSharkError(
                f"Precio inválido: {field_name}."
            ) from None

        if (
            not amount.is_finite()
            or amount < 0
            or amount > Decimal("99999999.99")
        ):
            raise CheapSharkError(
                f"Precio fuera de rango: {field_name}."
            )

        rounded = amount.quantize(Decimal("0.01"))

        if rounded != amount:
            raise CheapSharkError(
                f"El precio tiene más de dos decimales: {field_name}."
            )

        return rounded

    def _get_json(self, path, params=None):
        url = f"{self.BASE_URL}/{path}"

        if params:
            url = f"{url}?{urlencode(params)}"

        request = Request(
            url,
            headers={
                "User-Agent": "GameStoreUniversityProject/0.1",
                "Accept": "application/json",
            },
        )

        try:
            with urlopen(request, timeout=self.timeout) as response:
                return json.load(response)
        except (
            URLError,
            TimeoutError,
            UnicodeDecodeError,
            json.JSONDecodeError,
        ) as error:
            raise CheapSharkError(
                f"No se pudieron obtener los datos de CheapShark: {error}"
            ) from error