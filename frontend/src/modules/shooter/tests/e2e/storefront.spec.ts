import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function catalogApi(page: Page) {
  const games = [
    { id: 1, title: "Alpha", image_url: "/vortex-test.svg", lowest_price: "20.00", currency: "USD" },
    { id: 2, title: "Bravo", image_url: "/vortex-test.svg", lowest_price: "3.00", currency: "USD" },
    { id: 3, title: "DOOM", image_url: "/vortex-test.svg", lowest_price: "10.00", currency: "USD" },
  ];
  await page.route("**/vortex-test.svg", route => route.fulfill({ contentType: "image/svg+xml",
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="500"><rect width="900" height="500" fill="#746448"/></svg>' }));
  await page.route("**/api/v1/shooter/games/**", route => {
    const path = new URL(route.request().url()).pathname;
    const body = path.endsWith("/games/")
      ? { count: games.length, next: null, previous: null, results: games }
      : { ...games[2], description: "Un shooter de prueba", offers: [], screenshots: [] };
    return route.fulfill({ contentType: "application/json", body: JSON.stringify(body) });
  });
  await page.route("**/api/v1/shooter/**", route => {
    if (new URL(route.request().url()).pathname.includes("/games/")) return route.fallback();
    return route.fulfill({ contentType: "application/json",
      body: JSON.stringify({ rating_average: null, rating_count: 0, user_rating: null, count: 0, next: null, previous: null, results: [] }) });
  });
}

test("searches and sorts the current page, then clears an empty search", async ({ page }) => {
  await catalogApi(page);
  await page.goto("/shooter/");
  const titles = page.locator(".shooter-game-card h2");
  await expect(titles).toHaveText(["Alpha", "Bravo", "DOOM"]);
  await page.getByLabel("Ordenar juegos de esta página", { exact: true }).selectOption("price");
  await expect(titles).toHaveText(["Bravo", "DOOM", "Alpha"]);
  const search = page.getByLabel("Buscar en esta página", { exact: true });
  await search.fill("doom");
  await expect(titles).toHaveText(["DOOM"]);
  await search.fill("inexistente");
  await expect(page.getByRole("heading", { name: "No hay coincidencias en esta página" })).toBeVisible();
  await page.getByRole("button", { name: "Limpiar búsqueda", exact: true }).click();
  await expect(titles).toHaveCount(3);
});

test("featured game opens its real detail route", async ({ page }) => {
  await catalogApi(page);
  await page.goto("/shooter/");
  await page.getByRole("button", { name: "Ver juego destacado: DOOM", exact: true }).click();
  await expect(page).toHaveURL(/#game\/3$/);
  await expect(page.getByRole("heading", { name: "DOOM", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Iniciar sesión para calificar", exact: true })).toBeVisible();
});

test("mobile catalog fits the screen and keeps filters and game actions usable", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 740 });
  await catalogApi(page);
  await page.goto("/shooter/");
  await expect(page.getByRole("heading", { name: "Shooters para PC", exact: true })).toBeVisible();
  await expect(page.locator(".shooter-game-card")).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  await page.getByRole("button", { name: "Explorar catálogo", exact: true }).click();
  await expect(page.getByRole("button", { name: "Ver detalles de Alpha", exact: true })).toBeInViewport();
});
