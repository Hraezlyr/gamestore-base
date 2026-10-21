import json
import re
from urllib.parse import urlsplit
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from modules.shooter.domain.dtos import GameData, GamePage, ScreenshotData


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
        payload = self._get_json(
            "games",
            params={
                "genres": self.SHOOTER_GENRE_ID,
                "platforms": self.PC_PLATFORM_ID,
                "page": page,
                "page_size": page_size,
            },
        )

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
            screenshots=RawgClient._parse_screenshots(item.get("short_screenshots")),
        )

    @staticmethod
    def _parse_screenshots(items):
        # An omitted field must not erase a previously imported gallery.
        if items is None:
            return None
        if not isinstance(items, list):
            raise RawgError("Lista de capturas inválida.")

        screenshots = []
        seen = set()
        for item in items:
            if not isinstance(item, dict):
                raise RawgError("La captura no es un objeto.")
            screenshot_id = item.get("id")
            image = item.get("image")
            if type(screenshot_id) is not int or screenshot_id == 0 or screenshot_id < -1:
                raise RawgError("Identificador de captura inválido.")
            if not isinstance(image, str) or not image or len(image) > 1000:
                raise RawgError("URL de captura inválida.")
            try:
                parsed = urlsplit(image)
            except ValueError:
                raise RawgError("URL de captura inválida.") from None
            if parsed.scheme not in {"http", "https"} or not parsed.hostname:
                raise RawgError("URL de captura inválida.")
            # RAWG uses -1 for the cover, which is already image_url.
            if screenshot_id == -1:
                continue
            if screenshot_id in seen:
                raise RawgError("La respuesta contiene capturas duplicadas.")
            seen.add(screenshot_id)
            screenshots.append(ScreenshotData(screenshot_id, image))
        return tuple(screenshots)

    def fetch_steam_app_id(self, game_id: int) -> str | None:
        if type(game_id) is not int or game_id <= 0:
            raise RawgError("Identificador de RAWG inválido.")

        steam_ids = set()
        page_number = 1

        while True:
            payload = self._get_json(
                f"games/{game_id}/stores",
                params={"page": page_number, "page_size": 40},
            )

            if not isinstance(payload, dict):
                raise RawgError("Respuesta de tiendas inválida.")

            results = payload.get("results")

            if not isinstance(results, list):
                raise RawgError("La respuesta no contiene enlaces de tiendas.")

            if (
                "next" not in payload
                or (
                    payload["next"] is not None
                    and not isinstance(payload["next"], str)
                )
            ):
                raise RawgError("Información de paginación inválida.")

            for item in results:
                if not isinstance(item, dict):
                    raise RawgError("El enlace de tienda no es un objeto.")

                url = item.get("url")

                if not isinstance(url, str):
                    raise RawgError("URL de tienda inválida.")

                steam_id = self._extract_steam_app_id(url)

                if steam_id is not None:
                    steam_ids.add(steam_id)

            if not payload["next"]:
                break

            page_number += 1

        if len(steam_ids) == 1:
            return steam_ids.pop()

        return None

    @staticmethod
    def _extract_steam_app_id(url):
        try:
            parsed = urlsplit(url)
        except ValueError:
            raise RawgError("URL de tienda mal formada.") from None

        if (
            parsed.scheme not in {"http", "https"}
            or parsed.hostname != "store.steampowered.com"
        ):
            return None

        match = re.match(r"^/app/([1-9]\d*)(?:/|$)", parsed.path)

        return match.group(1) if match else None

    def _get_json(self, path, params=None):
        query = {"key": self.api_key}
        query.update(params or {})

        request = Request(
            f"{self.BASE_URL}/{path}?{urlencode(query)}",
            headers={
                "User-Agent": "GameStoreUniversityProject/0.1",
                "Accept": "application/json",
            },
        )

        try:
            with urlopen(request, timeout=self.timeout) as response:
                return json.load(response)
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
