import json
from urllib.error import URLError
from urllib.request import Request, urlopen
from urllib.parse import urlencode

from shooter.dtos import StoreData, GameMatchData


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