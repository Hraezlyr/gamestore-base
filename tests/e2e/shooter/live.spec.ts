import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";

test.describe("Live Django + React", () => {
  test.skip(process.env.SHOOTER_E2E_LIVE !== "1", "Enable explicitly against the development database.");
  const username = `shooter_e2e_${randomUUID().replaceAll("-", "")}`;
  const password = randomUUID();
  const title = `E2E ${username}`;
  const cwd = resolve(process.cwd(), "..");
  function django(code: string) {
    execFileSync("docker", ["compose", "exec", "-T", "backend", "python", "manage.py", "shell", "-c", code], { cwd, stdio: "pipe" });
  }
  test.beforeAll(() => {
    django(`from django.contrib.auth import get_user_model; get_user_model().objects.create_user(username='${username}', password='${password}', is_staff=True)`);
  });
  test.afterAll(() => {
    django(`from django.contrib.auth import get_user_model; from shooter.models import ShooterGame; ShooterGame.objects.filter(title__in=['${title}', '${title} editado']).delete(); get_user_model().objects.filter(username='${username}').delete()`);
  });
  test("logs in and creates, edits and deletes a game using real endpoints", async ({ page }) => {
    await page.goto("/shooter/");
    await page.getByRole("button", { name: "Acceso de administración", exact: true }).click();
    await page.getByLabel("Usuario", { exact: true }).fill(username);
    await page.getByLabel("Contraseña", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Administración de juegos" })).toBeVisible();
    await page.getByRole("button", { name: "Nuevo juego", exact: true }).click();
    await page.getByLabel("Título", { exact: true }).fill(title);
    await page.getByRole("button", { name: "Guardar juego" }).click();
    await expect(page.getByText("Juego guardado.", { exact: true })).toBeVisible();
    // Find the created record regardless of its alphabetic position.
    async function locate(name: string) {
      const button = page.getByRole("button", { name, exact: true });
      for (let i = 0; i < 100; i++) {
        await expect(page.locator(".shooter-admin tbody")).toBeVisible();
        if (await button.count()) return button;
        const next = page.getByRole("button", { name: "Siguiente", exact: true }).filter({ visible: true });
        if (await next.isDisabled()) throw new Error("Created game not found in pagination.");
        await next.click();
      }
      throw new Error("Pagination exceeded expected catalog size.");
    }
    await (await locate(`Editar ${title}`)).click();
    await page.getByLabel("Título", { exact: true }).fill(`${title} editado`);
    await page.getByRole("button", { name: "Guardar juego" }).click();
    await expect(page.getByText("Juego guardado.", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: `Eliminar ${title} editado`, exact: true }).click();
    await page.getByRole("button", { name: "Confirmar eliminación" }).click();
    await expect(page.getByText("Juego eliminado.", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await expect(page.getByRole("button", { name: "Acceso de administración", exact: true })).toBeVisible();
  });
});
