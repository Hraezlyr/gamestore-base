import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function api(page: Page, expired = false) {
  await page.route("**/test-*.svg", route => route.fulfill({
    contentType: "image/svg+xml",
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#7856e8"/></svg>',
  }));
  const summary = { id: 1, title: "Portal 2", image_url: "", lowest_price: "7.99", currency: "USD" };
  const games = [
    { ...summary, description: "Descripción", rawg_id: 4200, cheapshark_id: "36", steam_app_id: "620", created_at: "2026-01-01", updated_at: "2026-01-01" },
    { id: 2, title: "Sin ofertas", image_url: "", description: "", rawg_id: null, cheapshark_id: null, steam_app_id: "", created_at: "2026-01-01", updated_at: "2026-01-01" },
  ];
  const state = { renewals: 0 };
  await page.route("**/api/v1/shooter/**", async route => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();
    const respond = (body: unknown, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
    if (path.endsWith("/auth/token/")) {
      const credentials = request.postDataJSON();
      if (credentials.password !== "test-password") return respond({ detail: "Invalid" }, 401);
      return respond({ access: credentials.username === "client" ? "client" : "old", refresh: "refresh" });
    }
    if (path.endsWith("/auth/token/refresh/")) {
      state.renewals++;
      return respond({ access: "new" });
    }
    if (path.includes("/admin/")) {
      const token = request.headers().authorization;
      if (token === "Bearer client") return respond({ detail: "Forbidden" }, 403);
      if (expired && token === "Bearer old" && !url.searchParams.has("page_size")) return respond({ detail: "Expired" }, 401);
      if (method === "POST" || method === "PATCH") {
        const input = request.postDataJSON();
        if (input.title === "Inválido") return respond({ title: ["Título rechazado por el servidor."] }, 400);
        if (method === "POST") {
          const game = { ...games[1], ...input, id: 3 };
          games.push(game);
          return respond(game, 201);
        }
        const id = Number(path.split("/").filter(Boolean).at(-1));
        const game = games.find(game => game.id === id)!;
        Object.assign(game, input);
        return respond(game);
      }
      if (method === "DELETE") {
        const id = Number(path.split("/").filter(Boolean).at(-1));
        games.splice(games.findIndex(game => game.id === id), 1);
        return route.fulfill({ status: 204 });
      }
      return respond({ count: games.length, next: null, previous: null, results: games });
    }
    if (path.endsWith("/games/1/")) return respond({
      ...summary, description: "Descripción",
      screenshots: [{ id: 10, image_url: "/test-shot-1.svg" }, { id: 20, image_url: "/test-shot-2.svg" }],
      offers: [
        { id: 1, store_id: 3, store_name: "Otra tienda", store_icon_url: "", price: "7.99", retail_price: "19.99", currency: "USD", last_synced_at: "2026-01-01T12:00:00Z", purchase_url: "https://www.cheapshark.com/redirect?dealID=one%2B%3D" },
        { id: 2, store_id: 1, store_name: "Steam", store_icon_url: "/test-store.svg", price: "9.99", retail_price: "19.99", currency: "USD", last_synced_at: "2026-01-01T12:00:00Z", purchase_url: "https://www.cheapshark.com/redirect?dealID=two" },
      ],
    });
    return respond({ count: 1, next: null, previous: null, results: [summary] });
  });
  return state;
}

async function login(page: Page, username = "admin") {
  await page.getByRole("button", { name: "Acceso de administración", exact: true }).click();
  await page.getByLabel("Usuario", { exact: true }).fill(username);
  await page.getByLabel("Contraseña", { exact: true }).fill("test-password");
  await page.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
}

test("shared sidebar switches modules and restores shooter detail with browser history", async ({ page }) => {
  await api(page);
  await page.route("**/api/v1/template/**", route => route.fulfill({
    contentType: "application/json", body: "[]",
  }));
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Catálogos de GameStore" });
  await expect(navigation.getByRole("button", { name: "Shooters", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("main")).toHaveCount(1);
  await page.getByRole("button", { name: "Ver detalles de Portal 2" }).click();
  await expect(page).toHaveURL(/#game\/1$/);
  await navigation.getByRole("button", { name: "Módulo Plantilla", exact: true }).click();
  await expect(page).toHaveURL(/\/template\/$/);
  await expect(page.getByRole("heading", { name: "Módulo Plantilla", exact: true })).toBeVisible();
  await expect(page.getByText("No hay títulos registrados aún", { exact: false })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Portal 2", exact: true })).toBeVisible();
  await expect(page).toHaveURL(/#game\/1$/);
  await navigation.getByRole("button", { name: "Shooters", exact: true }).click();
  await expect(page).toHaveURL(/\/shooter\/$/);
  await expect(page.getByRole("heading", { name: "Shooters para PC", exact: true })).toBeVisible();
});

test("public catalog shows each store price and a safe purchase link", async ({ page }) => {
  await api(page);
  await page.goto("/shooter/");
  await page.getByRole("button", { name: "Ver detalles de Portal 2" }).click();
  await expect(page).toHaveURL(/#game\/1$/);
  const steamIcon = page.getByRole("button", { name: "Ver oferta de Steam", exact: true });
  await expect(steamIcon.locator("img")).toHaveAttribute("src", "/test-store.svg");
  await expect(page.getByRole("dialog", { name: "Steam", exact: true })).toHaveCount(0);
  await expect(page.getByText("Última sincronización", { exact: true })).toHaveCount(0);
  await steamIcon.hover();
  const steam = page.getByRole("dialog", { name: "Steam", exact: true });
  await expect(steam).toContainText("9.99");
  const purchase = steam.getByRole("link", { name: "Ver oferta en Steam" });
  await purchase.hover();
  await expect(purchase).toBeVisible();
  await expect(purchase).toHaveAttribute("href", "https://www.cheapshark.com/redirect?dealID=two");
  await page.getByRole("button", { name: "Ver oferta de Otra tienda", exact: true }).hover();
  const other = page.getByRole("dialog", { name: "Otra tienda", exact: true });
  await expect(other).toContainText("7.99");
  await expect(other).toContainText("Mejor precio");
  await expect(steam).toHaveCount(0);
  await expect(page.getByRole("link", { name: "RAWG", exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Shooters para PC" })).toBeVisible();
});

test("store details support keyboard focus, purchase navigation and Escape", async ({ page }) => {
  await api(page);
  await page.goto("/shooter/#game/1");
  const trigger = page.getByRole("button", { name: "Ver oferta de Steam", exact: true });
  await trigger.focus();
  const details = page.getByRole("dialog", { name: "Steam", exact: true });
  await expect(details).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(details.getByRole("button", { name: "Cerrar oferta" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(details.getByRole("link", { name: "Ver oferta en Steam" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(details).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("store details open with touch and stay within a narrow screen", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 740 }, hasTouch: true });
  try {
    const page = await context.newPage();
    await api(page);
    await page.goto("http://127.0.0.1:5173/shooter/#game/1");
    await page.getByRole("button", { name: "Ver oferta de Steam", exact: true }).tap();
    const details = page.getByRole("dialog", { name: "Steam", exact: true });
    await expect(details).toBeVisible();
    await expect(details.getByRole("link", { name: "Ver oferta en Steam" })).toBeVisible();
    const box = await details.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
    await page.getByRole("heading", { name: "Portal 2", exact: true }).tap();
    await expect(details).toHaveCount(0);
  } finally {
    await context.close();
  }
});

test("gallery selects screenshots, opens full screen and closes with keyboard", async ({ page }) => {
  await api(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/shooter/#game/1");
  await page.getByRole("button", { name: "Mostrar Portal 2 — captura 2", exact: true }).click();
  await expect(page.locator(".shooter-gallery__preview img")).toHaveAttribute("src", "/test-shot-2.svg");
  await page.getByRole("button", { name: "Ampliar imagen de Portal 2" }).click();
  await expect(page.getByRole("button", { name: "Cerrar galería", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Imagen anterior", exact: true }).click();
  await expect(page.getByRole("button", { name: "Imagen anterior", exact: true })).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Cerrar galería", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Ampliar imagen de Portal 2" })).toBeFocused();
});

test("direct detail links work on a narrow viewport without page overflow", async ({ page }) => {
  await api(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/shooter/#game/1");
  await expect(page.getByRole("heading", { name: "Portal 2", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.setViewportSize({ width: 320, height: 740 });
  await page.getByRole("button", { name: "Volver al catálogo" }).click();
  await expect(page.getByRole("button", { name: "Ver detalles de Portal 2" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("administrator creates, edits, cancels deletion, deletes and logs out", async ({ page }) => {
  await api(page);
  await page.goto("/shooter/");
  await login(page);
  await expect(page.getByRole("cell", { name: "Pendiente de vinculación" })).toBeVisible();
  await page.getByRole("button", { name: "Nuevo juego", exact: true }).click();
  await page.getByLabel("Título", { exact: true }).fill("Nuevo shooter");
  await page.getByLabel("Descripción", { exact: true }).fill("Descripción nueva");
  await page.getByRole("button", { name: "Guardar juego" }).click();
  await page.getByRole("button", { name: "Editar Nuevo shooter", exact: true }).click();
  await page.getByLabel("Título", { exact: true }).fill("Shooter editado");
  await page.getByRole("button", { name: "Guardar juego" }).click();
  await page.getByRole("button", { name: "Eliminar Shooter editado", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Cancelar" }).click();
  await expect(page.getByRole("button", { name: "Editar Shooter editado", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Eliminar Shooter editado", exact: true }).click();
  await page.getByRole("button", { name: "Confirmar eliminación" }).click();
  await expect(page.getByRole("button", { name: "Editar Shooter editado", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page.getByRole("button", { name: "Acceso de administración", exact: true })).toBeVisible();
});

test("non-admin users cannot enter administration", async ({ page }) => {
  await api(page);
  await page.goto("/shooter/");
  await login(page, "client");
  await expect(page.getByRole("alert")).toContainText("No tienes permisos");
  await expect(page.getByRole("button", { name: "Nuevo juego", exact: true })).toHaveCount(0);
});

test("expired access tokens renew once and the list loads", async ({ page }) => {
  const state = await api(page, true);
  await page.goto("/shooter/");
  await login(page);
  await expect(page.getByRole("button", { name: "Editar Portal 2", exact: true })).toBeVisible();
  expect(state.renewals).toBe(1);
});

test("field validation preserves the form and allows correction", async ({ page }) => {
  await api(page);
  await page.goto("/shooter/");
  await login(page);
  await page.getByRole("button", { name: "Nuevo juego", exact: true }).click();
  await page.getByLabel("Título", { exact: true }).fill("Inválido");
  await page.getByRole("button", { name: "Guardar juego" }).click();
  await expect(page.getByText("Título rechazado por el servidor.")).toBeVisible();
  await expect(page.getByLabel("Título", { exact: true })).toHaveValue("Inválido");
  await page.getByLabel("Título", { exact: true }).fill("Corregido");
  await page.getByRole("button", { name: "Guardar juego" }).click();
  await expect(page.getByRole("button", { name: "Editar Corregido", exact: true })).toBeVisible();
});
