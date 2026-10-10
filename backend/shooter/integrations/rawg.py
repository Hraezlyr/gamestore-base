import json
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from shooter.dtos import GameData, GamePage


class RawgError(Exception):
    """Error al consultar o interpretar los datos de RAWG."""


class RawgClient:
    BASE_URL = "https://api.rawg.io/api"
    SHOOTER_GENRE_ID = 2
    PC_PLATFORM_ID = 4

    def __init__(self, api_key, timeout=15):
        if not api_key:
            raise RawgError("La API key de RAWG no está configurada.")

        self.api_key = api_key
        self.timeout = timeout

    def fetch_shooter_games(self, page=1, page_size=20):
        params = urlencode({
            "key": self.api_key,
            "genres": self.SHOOTER_GENRE_ID,
            "platforms": self.PC_PLATFORM_ID,
            "page": page,
            "page_size": page_size,
        })

        request = Request(
            f"{self.BASE_URL}/games?{params}",
            headers={
                "User-Agent": "GameStoreUniversityProject/0.1",
                "Accept": "application/json",
            },
        )

        try:
            with urlopen(request, timeout=self.timeout) as response:
                payload = json.load(response)
        except HTTPError as error:
            raise RawgError(
                f"RAWG respondió HTTP {error.code}."
            ) from None
        except (URLError, TimeoutError):
            raise RawgError(
                "No se pudo establecer conexión con RAWG."
            ) from None
        except (json.JSONDecodeError, UnicodeDecodeError):
            raise RawgError(
                "RAWG devolvió una respuesta ilegible."
            ) from None

        if not isinstance(payload, dict):
            raise RawgError("RAWG no devolvió un objeto.")

        results = payload.get("results")

        if not isinstance(results, list):
            raise RawgError("RAWG no devolvió una lista de juegos.")

        if (
            "next" not in payload
            or (
                payload["next"] is not None
                and not isinstance(payload["next"], str)
            )
        ):
            raise RawgError("Información de paginación inválida.")

        return GamePage(
            games=tuple(self._parse_game(item) for item in results),
            has_next=bool(payload["next"]),
        )

    @staticmethod
    def _parse_game(item):
        if not isinstance(item, dict):
            raise RawgError("El juego no es un objeto.")

        game_id = item.get("id")
        title = item.get("name")
        image_url = item.get("background_image")

        if type(game_id) is not int or game_id <= 0:
            raise RawgError("Identificador de juego inválido.")

        if (
            not isinstance(title, str)
            or not title.strip()
            or len(title) > 255
        ):
            raise RawgError(f"Título inválido para el juego {game_id}.")

        if image_url is None:
            image_url = ""

        if not isinstance(image_url, str) or len(image_url) > 1000:
            raise RawgError(f"Imagen inválida para el juego {game_id}.")

        return GameData(
            external_id=game_id,
            title=title,
            image_url=image_url,
        )