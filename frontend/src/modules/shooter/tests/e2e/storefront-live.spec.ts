import { expect, test } from "@playwright/test";
import process from "node:process";
import type { RatingSummary } from "../../types/rating";

test("loads real catalog and rating summary through the frontend proxy", async ({ page }) => {
  test.skip(process.env.SHOOTER_SPRINT2_LIVE !== "1", "Enable against the running Sprint 2 server.");
  const catalog = await page.request.get("/api/v1/shooter/games/?page_size=1");
  expect(catalog.ok()).toBeTruthy();
  const body: { results: { id: number; title: string }[] } = await catalog.json();
  const game = body.results[0];
  test.skip(!game, "A game with an available offer is required.");
  const response = await page.request.get(`/api/v1/shooter/${game.id}/rate/`);
  expect(response.status()).toBe(200);
  const summary: RatingSummary = await response.json();
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/shooter/");
    await expect(page.locator(".shooter-game-card").first()).toBeVisible();
    await expect.poll(() => page.locator(".vortex-hero__image").evaluate(image =>
      (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0), { timeout: 20000 }).toBeTruthy();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.screenshot({ path: test.info().outputPath(`storefront-live-${width}.png`) });
  }
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`/shooter/#game/${game.id}`);
  await expect(page.getByRole("heading", { name: game.title, exact: true })).toBeVisible();
  const ratings = page.getByRole("region", { name: "Calificaciones de la comunidad" });
  const expected = summary.rating_count && summary.rating_average !== null
    ? `${summary.rating_average.toFixed(1)} de 5 · ${summary.rating_count} ${summary.rating_count === 1 ? "calificación" : "calificaciones"}`
    : "Sin calificaciones todavía";
  await expect(ratings.getByText(expected, { exact: true })).toBeVisible();
  await ratings.getByRole("button", { name: "Iniciar sesión para calificar", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Iniciar sesión para calificar", exact: true });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(dialog).not.toBeVisible();
});
