# Módulo shooter

Catálogo de shooters para PC con metadatos de RAWG y precios en USD de CheapShark.
La interfaz está disponible en `http://localhost:5173/shooter/`.
Los detalles pueden compartirse como `/shooter/#game/<id>`; los botones del navegador
permiten regresar al catálogo.

## Puesta en marcha

Desde la raíz del repositorio:

```powershell
# Solo si todavía no existe .env:
Copy-Item .env.example .env
docker compose up -d --build
docker compose exec backend python manage.py createsuperuser
```

Configura `RAWG_API_KEY` en `.env` para importar el catálogo. CheapShark no requiere
clave. Las credenciales de proveedores se utilizan exclusivamente en el backend.
El usuario de administración debe tener `is_staff=True`; un superusuario cumple
esa condición.

Después de actualizar una instalación existente:

```powershell
docker compose exec backend python manage.py migrate
docker compose exec frontend npm ci
docker compose restart frontend
```

## Sincronización

```powershell
docker compose exec backend python manage.py sync_shooter_stores
docker compose exec backend python manage.py sync_shooter_games --max-pages 2
docker compose exec backend python manage.py link_shooter_games --limit 50
docker compose exec backend python manage.py sync_shooter_offers --limit 50
```

Los comandos de vinculación y ofertas aceptan `--after-id`. Usa el último ID
procesado para continuar con el siguiente lote. El límite cuenta juegos
procesados y no garantiza que todos tengan coincidencias u ofertas.

La vinculación exige una coincidencia única por Steam App ID. Los juegos sin
coincidencia permanecen guardados. RAWG puede clasificar un juego en varios
géneros: basta con que esté etiquetado como shooter y disponible para PC.

La sincronización de ofertas es atómica por juego: crea, actualiza, reactiva y
desactiva ofertas ausentes. Una respuesta válida vacía desactiva todas sus
ofertas. Un error HTTP, de validación o persistencia conserva el estado previo
de ese juego; los juegos anteriores del lote ya procesados permanecen guardados.
Los precios y sus tiendas se conservan asociados mediante el deal ID.

La sincronización de tiendas importa sus iconos de CheapShark. La de juegos
importa las capturas de `short_screenshots` de RAWG en el orden del proveedor;
el elemento `id=-1` representa la portada y no se duplica en la galería.
Estas capturas son la selección del listado, no necesariamente todas las del juego.
Los campos multimedia omitidos conservan lo importado; una lista de capturas
explícitamente vacía limpia esa galería. No se consulta al proveedor al abrir
una página. Repite los dos primeros comandos para llenar estos datos en juegos
y tiendas existentes.

## Reglas del catálogo y administración

- El catálogo público incluye juegos con al menos una oferta activa en USD de
  una tienda activa. `0.00` es válido y representa un juego gratuito.
- El precio del listado es el menor de las ofertas disponibles. El detalle
  muestra precio actual, regular, moneda, fecha de sincronización y enlace
  de compra de cada oferta.
- La administración incluye también juegos sin ofertas. Permite crear, editar
  y eliminar juegos; los campos editables son título, descripción e imagen.
- Los identificadores externos y precios son gestionados por la sincronización.
  Un juego creado manualmente sin ofertas no aparece en el catálogo público.
- RAWG puede reemplazar título e imagen durante una nueva importación; la
  descripción local se conserva.
- Eliminar un juego elimina sus ofertas y capturas, pero conserva las tiendas. Una futura
  importación puede volver a crear un juego eliminado que siga en RAWG.
- Los tokens de sesión se guardan en memoria: recargar requiere otro login.
  Un 401 renueva el acceso y reintenta una vez; las solicitudes simultáneas
  comparten la renovación. Un refresh inválido cierra la sesión.
- Cerrar sesión descarta los tokens locales. No revoca tokens ya emitidos
  por el servidor; estos siguen sujetos a su expiración.

## API

Prefijo: `/api/v1/shooter/`.

| Ruta | Métodos | Acceso |
|---|---|---|
| `games/` | GET | Público; listado paginado |
| `games/<id>/` | GET | Público; detalle disponible o 404 |
| `admin/games/` | GET, POST | Administrador |
| `admin/games/<id>/` | GET, PUT, PATCH, DELETE | Administrador |
| `auth/token/` | POST | Credenciales: username, password |
| `auth/token/refresh/` | POST | Refresh token |

Las peticiones administrativas usan `Authorization: Bearer <access>`.
Los listados devuelven `count`, `next`, `previous`, `results`. El tamaño por
defecto es 20; `page_size` permite hasta 100. Los precios JSON son cadenas.
El detalle añade `screenshots: [{id, image_url}]`; cada oferta incluye
`store_icon_url`. Estos campos multimedia son de solo lectura.

## Arquitectura

El backend separa DTO, contratos, clientes de proveedores, repositorios y casos
de uso. Los comandos componen dependencias y presentan resultados. Los selectors
centralizan la disponibilidad del catálogo; los serializers definen su JSON.

El frontend separa transporte HTTP, endpoints, tipos, hooks, componentes, páginas
y estilos dentro de `features/shooter`. `useApiQuery` comparte estados de consulta,
cancelación y reintentos. `useFormSubmission` comparte envío y errores de
formularios. `SessionManager` recibe un contrato de autenticación inyectado y
gestiona tokens y renovación. Las páginas coordinan la presentación y los hooks
de acciones realizan el CRUD.

Lucide React proporciona iconos de acciones; las marcas de tiendas provienen
de CheapShark. Motion anima la entrada de vistas y los cambios de imagen y respeta
el movimiento reducido. `GameGallery` administra miniaturas y selección;
`GameLightbox` utiliza Yet Another React Lightbox con zoom y se carga solo al
ampliar una imagen. La galería admite teclado, gestos y cierre con Escape.
`GameOffers` presenta los precios asociados a cada tienda.

## Pruebas

Todas las pruebas viven en la raíz, dentro de `tests/`.

```powershell
docker compose exec backend python manage.py test tests.unit.shooter tests.integration.shooter
docker compose exec frontend npm run build
docker compose exec frontend npm run lint
docker compose exec frontend npm test
```

Para las pruebas de navegador, usa Node 22 y ejecuta desde `frontend/`:

```powershell
npm.cmd ci
npx.cmd playwright install chromium
npm.cmd run test:e2e
```

En Linux utiliza `npm` y `npx`. Vitest prueba HTTP y sesión sin navegador.
Playwright verifica navegación, precios, logos, galería, CRUD, permisos, validación, renovación
y una pantalla estrecha con respuestas de API controladas.

El flujo real completo se activa explícitamente con Docker funcionando:

```powershell
$env:SHOOTER_E2E_LIVE = '1'
npm.cmd run test:e2e
Remove-Item Env:SHOOTER_E2E_LIVE
```

Esta prueba crea un usuario administrador y un juego con nombres únicos en la
base de desarrollo y los limpia al finalizar. Las pruebas Django usan su propia
base temporal. CI ejecuta las suites, incluida la prueba real, sobre PostgreSQL
efímero sin consultar APIs externas.

Si Vite se ejecuta fuera de Docker, configura `API_PROXY_TARGET` como
`http://127.0.0.1:8000`. Dentro de Docker utiliza `http://backend:8000`.

## Proveedores

El catálogo incluye enlaces de atribución a [RAWG](https://rawg.io/apidocs).
Las ofertas enlazan a la página de redirección de
[CheapShark](https://apidocs.cheapshark.com/), conservando la codificación del
deal ID. Los precios pueden cambiar después de la última sincronización.
