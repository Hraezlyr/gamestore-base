import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import type { SavedRating } from "../../types/rating";

async function ratingApi(page: Page, rejectFirst = false) {
  const scores: (SavedRating & { userId: number })[] = [];
  const state = { submissions: 0, registrations: 0 };
  const accounts = new Map([
    ["alice", { id: 1, password: "test-password" }], ["bob", { id: 2, password: "test-password" }],
  ]);
  const summary = (userId?: number) => ({
    rating_average: scores.length ? scores.reduce((sum, rating) => sum + rating.score, 0) / scores.length : null,
    rating_count: scores.length,
    user_rating: scores.find(rating => rating.userId === userId) ?? null,
  });
  await page.route(/\/api\/v1\/shooter\//, async route => {
    const respond = (body: unknown, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
    const path = new URL(route.request().url()).pathname;
    const username = route.request().headers().authorization?.replace("Bearer rating-", "");
    const userId = username ? accounts.get(username)?.id : undefined;
    if (path.endsWith("/register/")) {
      state.registrations++;
      const input = route.request().postDataJSON() as { username: string; password: string; password_confirm: string };
      if (accounts.has(input.username)) return respond({ username: ["Este usuario ya existe."] }, 400);
      if (input.password !== input.password_confirm) return respond({ password_confirm: ["Las contraseñas no coinciden."] }, 400);
      const account = { id: accounts.size + 1, password: input.password };
      accounts.set(input.username, account);
      return respond({ id: account.id, username: input.username }, 201);
    }
    if (path.endsWith("/auth/token/")) {
      const input = route.request().postDataJSON() as { username: string; password: string };
      if (accounts.get(input.username)?.password !== input.password) return respond({ detail: "Invalid credentials" }, 401);
      return respond({ access: `rating-${input.username}`, refresh: `refresh-${input.username}` });
    }
    if (path.endsWith("/account/")) return userId ? respond({ id: userId, username }) : respond({ detail: "Inicia sesión." }, 401);
    if (path.endsWith("/games/")) return respond({ count: 0, next: null, previous: null, results: [] });
    if (path.endsWith("/reviews/")) return respond({ count: scores.length, next: null, previous: null,
      results: [...scores].reverse().map(rating => ({ ...rating, author: [...accounts].find(([, account]) => account.id === rating.userId)?.[0] })),
    });
    if (path.endsWith("/rate/") && route.request().method() === "GET") return respond(summary(userId));
    if (path.endsWith("/rate/")) {
      state.submissions++;
      if (!userId) return respond({ detail: "Inicia sesión para calificar." }, 401);
      if (scores.some(rating => rating.userId === userId)) return respond({ detail: "Ya calificaste este juego." }, 400);
      const payload = route.request().postDataJSON() as { score: number; comment: string };
      if (rejectFirst && state.submissions === 1) return respond({ comment: ["Reseña rechazada por el servidor."] }, 400);
      const rating = { ...payload, userId, id: scores.length + 1, created_at: "2026-10-17T12:00:00Z" };
      scores.push(rating);
      return respond({ ...summary(userId), rating }, 201);
    }
    return respond({ id: 1, title: "Portal 2", image_url: "", lowest_price: "7.99", currency: "USD", description: "Shooter de prueba", offers: [], screenshots: [], ...summary() });
  });
  return state;
}

async function login(page: Page, username = "alice") {
  await page.getByRole("button", { name: "Iniciar sesión para calificar", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Iniciar sesión para calificar", exact: true });
  await dialog.getByLabel("Usuario", { exact: true }).fill(username);
  await dialog.getByLabel("Contraseña", { exact: true }).fill("test-password");
  await dialog.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText(`Sesión: ${username}`, { exact: false })).toBeVisible();
}

test("limits each account to one review across reload and login, while another account can vote", async ({ page }) => {
  const state = await ratingApi(page);
  await page.goto("/shooter/#game/1");
  await expect(page.getByText("Sin calificaciones todavía")).toBeVisible();
  await expect(page.getByRole("button", { name: "Calificar juego", exact: true })).toHaveCount(0);
  for (const [score, average, count, username] of [[5, "5.0", 1, "alice"], [2, "3.5", 2, "bob"]] as const) {
    await login(page, username);
    await page.getByRole("button", { name: "Calificar juego", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Calificar Portal 2" });
    await expect(dialog.getByRole("button", { name: "Enviar reseña" })).toBeDisabled();
    await dialog.getByRole("radio", { name: `${score} estrellas`, exact: true }).check();
    await dialog.getByLabel("Tu reseña", { exact: true }).fill(`Mi puntuación es ${score}`);
    if (count === 1) await page.screenshot({ path: test.info().outputPath("rating-desktop.png") });
    await dialog.getByRole("button", { name: "Enviar reseña" }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole("status")).toContainText("Tu reseña se guardó");
    await expect(page.getByText(`${average} de 5 · ${count} ${count === 1 ? "calificación" : "calificaciones"}`, { exact: true })).toBeVisible();
    await expect(page.getByText(`Ya calificaste este juego. Tu calificación: ${score} de 5.`, { exact: true })).toBeVisible();
    const publicReview = page.getByRole("article", { name: `Reseña de ${username}`, exact: true });
    await expect(publicReview.getByText(`${score} de 5`, { exact: true })).toBeVisible();
    await expect(publicReview.getByText(`Mi puntuación es ${score}`, { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Calificar juego", exact: true })).toHaveCount(0);
    await page.reload();
    await login(page, username);
    await expect(page.getByText(`Ya calificaste este juego. Tu calificación: ${score} de 5.`, { exact: true })).toBeVisible();
    await page.getByRole("region", { name: "Calificaciones de la comunidad", exact: true })
      .getByRole("button", { name: "Cerrar sesión", exact: true }).click();
  }
  expect(state.submissions).toBe(2);
  await page.reload();
  await expect(page.getByText("3.5 de 5 · 2 calificaciones", { exact: true })).toBeVisible();
  await expect(page.getByRole("article", { name: "Reseña de alice", exact: true })).toBeVisible();
  await expect(page.getByRole("article", { name: "Reseña de bob", exact: true })).toBeVisible();
  await page.setViewportSize({ width: 375, height: 740 });
  await page.screenshot({ path: test.info().outputPath("public-reviews-mobile.png"), fullPage: true });
});

test("retries public reviews and navigates pages without logging in", async ({ page }) => {
  await ratingApi(page);
  let unavailable = true;
  await page.route("**/shooter/1/reviews/**", route => {
    if (unavailable) return route.fulfill({ status: 503, contentType: "application/json", body: "{}" });
    const second = new URL(route.request().url()).searchParams.get("page") === "2";
    return route.fulfill({ contentType: "application/json", body: JSON.stringify({
      count: 6, next: second ? null : "?page=2", previous: second ? "?page=1" : null,
      results: [{ id: second ? 1 : 6, author: second ? "alice" : "bob", score: second ? 5 : 2,
        comment: second ? "Primera reseña" : "<script>Texto de la reseña</script>", created_at: "2026-10-17T12:00:00Z" }],
    }) });
  });
  await page.goto("/shooter/#game/1");
  const reviews = page.getByRole("region", { name: "Reseñas de la comunidad", exact: true });
  await expect(reviews.getByRole("alert")).toBeVisible();
  unavailable = false;
  await reviews.getByRole("button", { name: "Reintentar reseñas" }).click();
  await expect(reviews.getByText("<script>Texto de la reseña</script>", { exact: true })).toBeVisible();
  await reviews.getByRole("button", { name: "Más reseñas", exact: true }).click();
  await expect(reviews.getByRole("article", { name: "Reseña de alice", exact: true })).toBeVisible();
  await expect(reviews.getByRole("button", { name: "Más reseñas", exact: true })).toBeDisabled();
  await reviews.getByRole("button", { name: "Reseñas anteriores", exact: true }).click();
  await expect(reviews.getByRole("article", { name: "Reseña de bob", exact: true })).toBeVisible();
});

test("registers from the rating section, handles errors and lets the new account rate", async ({ page }) => {
  const state = await ratingApi(page);
  await page.goto("/shooter/#game/1");
  await page.getByRole("button", { name: "Iniciar sesión para calificar", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "No tengo cuenta: registrarme", exact: true }).click();
  const signup = page.getByRole("dialog", { name: "Crear cuenta", exact: true });
  await signup.getByLabel("Usuario", { exact: true }).fill("alice");
  await signup.getByLabel("Contraseña", { exact: true }).fill("Puzzle!Moon!6823");
  await signup.getByLabel("Confirmar contraseña", { exact: true }).fill("Puzzle!Moon!6823");
  await signup.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  await expect(signup.getByRole("alert")).toContainText("Este usuario ya existe.");
  await signup.getByLabel("Usuario", { exact: true }).fill("charlie");
  await signup.getByLabel("Confirmar contraseña", { exact: true }).fill("Another!Password!123");
  await signup.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  await expect(signup.getByRole("alert")).toContainText("Las contraseñas no coinciden.");
  await signup.getByLabel("Confirmar contraseña", { exact: true }).fill("Puzzle!Moon!6823");
  await signup.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  const signin = page.getByRole("dialog", { name: "Iniciar sesión para calificar", exact: true });
  await expect(signin.getByRole("status")).toContainText("Cuenta creada");
  await expect(signin.getByLabel("Usuario", { exact: true })).toHaveValue("charlie");
  await expect(signin.getByLabel("Contraseña", { exact: true })).toHaveValue("");
  await signin.getByLabel("Contraseña", { exact: true }).fill("Puzzle!Moon!6823");
  await signin.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
  await page.getByRole("button", { name: "Calificar juego", exact: true }).click();
  const review = page.getByRole("dialog", { name: "Calificar Portal 2", exact: true });
  await review.getByRole("radio", { name: "5 estrellas", exact: true }).check();
  await review.getByLabel("Tu reseña", { exact: true }).fill("Mi primera reseña");
  await review.getByRole("button", { name: "Enviar reseña", exact: true }).click();
  await expect(page.getByText("Ya calificaste este juego. Tu calificación: 5 de 5.", { exact: true })).toBeVisible();
  expect(state.registrations).toBe(3);
  expect(state.submissions).toBe(1);
});

test("login offers registration and registration returns to login on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 740 });
  await ratingApi(page);
  await page.goto("/shooter/#game/1");
  await page.getByRole("button", { name: "Iniciar sesión para calificar", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "No tengo cuenta: registrarme", exact: true }).click();
  const signup = page.getByRole("dialog", { name: "Crear cuenta", exact: true });
  await expect(signup.getByLabel("Confirmar contraseña", { exact: true })).toBeVisible();
  expect((await signup.boundingBox())!.width).toBeLessThanOrEqual(375);
  await page.screenshot({ path: test.info().outputPath("registration-mobile.png") });
  await signup.getByRole("button", { name: "Ya tengo cuenta: iniciar sesión", exact: true }).click();
  const signin = page.getByRole("dialog", { name: "Iniciar sesión para calificar", exact: true });
  await expect(signin.getByLabel("Contraseña", { exact: true })).toBeVisible();
  const cancel = await signin.getByRole("button", { name: "Cancelar", exact: true }).boundingBox();
  const register = await signin.getByRole("button", { name: "No tengo cuenta: registrarme", exact: true }).boundingBox();
  expect(register!.y - (cancel!.y + cancel!.height)).toBeGreaterThanOrEqual(12);
  await page.screenshot({ path: test.info().outputPath("login-spacing-mobile.png") });
  await signin.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(signin).not.toBeVisible();
});

test("shows validation errors, retains the review and allows retry", async ({ page }) => {
  const state = await ratingApi(page, true);
  await page.goto("/shooter/#game/1");
  await login(page);
  await page.getByRole("button", { name: "Calificar juego", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("radio", { name: "4 estrellas", exact: true }).check();
  await dialog.getByLabel("Tu reseña", { exact: true }).fill("Buen juego");
  await dialog.getByRole("button", { name: "Enviar reseña" }).click();
  await expect(dialog.getByText("Reseña rechazada por el servidor.", { exact: true })).toBeVisible();
  await expect(dialog.getByLabel("Tu reseña", { exact: true })).toHaveValue("Buen juego");
  await expect(page.getByText("Sin calificaciones todavía")).toBeVisible();
  await dialog.getByRole("button", { name: "Enviar reseña" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText("4.0 de 5 · 1 calificación", { exact: true })).toBeVisible();
  expect(state.submissions).toBe(2);
});

test("supports keyboard, cancellation, mobile and pending submission", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 740 });
  await ratingApi(page);
  await page.goto("/shooter/#game/1");
  await login(page);
  const opener = page.getByRole("button", { name: "Calificar juego", exact: true });
  await opener.click();
  const dialog = page.getByRole("dialog");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
  await opener.click();
  const first = dialog.getByRole("radio", { name: "1 estrella", exact: true });
  await first.focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowRight");
  await expect(dialog.getByRole("radio", { name: "2 estrellas", exact: true })).toBeChecked();
  await dialog.getByLabel("Tu reseña", { exact: true }).fill("Reseña con teclado");
  await page.screenshot({ path: test.info().outputPath("rating-mobile.png") });
  let release: () => void = () => {};
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/shooter/1/rate/", async route => { await gate; await route.fallback(); });
  await dialog.getByRole("button", { name: "Enviar reseña" }).click();
  await expect(dialog.getByRole("button", { name: "Enviando…" })).toBeDisabled();
  await expect(dialog.getByLabel("Tu reseña", { exact: true })).toBeDisabled();
  await expect(dialog.getByRole("button", { name: "Cancelar", exact: true })).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();
  expect(box!.width).toBeLessThanOrEqual(375);
  release();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText("2.0 de 5 · 1 calificación", { exact: true })).toBeVisible();
});
