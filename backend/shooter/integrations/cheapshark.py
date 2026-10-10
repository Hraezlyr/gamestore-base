import json
from urllib.error import URLError
from urllib.request import Request, urlopen

from shooter.dtos import StoreData


class CheapSharkError(Exception):
    """Error al consultar o interpretar los datos de CheapShark."""


class CheapSharkClient:
    BASE_URL = "https://www.cheapshark.com/api/1.0"

    def __init__(self, timeout=15):
        self.timeout = timeout

    def fetch_stores(self):
        request = Request(
            f"{self.BASE_URL}/stores",
            headers={
                "User-Agent": "GameStoreUniversityProject/0.1",
                "Accept": "application/json",
            },
        )

        try:
            with urlopen(request, timeout=self.timeout) as response:
                payload = json.load(response)
        except (
            URLError,
            TimeoutError,
            UnicodeDecodeError,
            json.JSONDecodeError,
        ) as error:
            raise CheapSharkError(
                f"No se pudieron obtener las tiendas: {error}"
            ) from error

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