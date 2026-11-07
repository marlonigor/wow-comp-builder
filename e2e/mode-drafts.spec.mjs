import { expect, test } from "@playwright/test";
import "./ui-coverage.mjs";

test("alternar modos preserva o grupo e a masmorra após recarregar", async ({ page }) => {
  await page.goto("/?m=5&dg=hall-of-thanes&c=warrior-protection");
  const mode = page.getByRole("combobox", { name: "Modo", exact: true });
  await mode.selectOption("10");
  await page.getByRole("textbox").fill("rdruid");
  await page.getByRole("textbox").press("Enter");
  await page.reload();
  await mode.selectOption("5");
  await expect(page.getByRole("button", { name: "Remover Protection da vaga 1" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Dungeon", exact: true })).toHaveValue("hall-of-thanes");
  await mode.selectOption("10");
  await expect(page.getByRole("button", { name: "Remover Restoration da vaga 3" })).toBeVisible();
  await page.getByRole("button", { name: "Limpar composição", exact: true }).click();
  await page.getByRole("button", { name: "Confirmar limpeza" }).click();
  await mode.selectOption("5");
  await expect(page.getByRole("button", { name: "Remover Protection da vaga 1" })).toBeVisible();
  await mode.selectOption("10");
  await expect(page.getByRole("heading", { name: "Composição 0/10" })).toBeVisible();
});

test("confirmação móvel mantém foco seguro e Escape cancela", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?m=5&dg=general&c=warrior-protection");
  const clear = page.getByRole("button", { name: "Limpar composição", exact: true });
  await clear.click();
  await expect(page.getByRole("button", { name: "Cancelar", exact: true })).toBeFocused();
  await expect(page.getByRole("button", { name: "Confirmar limpeza" })).toBeInViewport();
  await page.screenshot({ path: testInfo.outputPath("confirmacao-mobile.png") });
  await page.keyboard.press("Escape");
  await expect(clear).toBeFocused();
  await expect(page.getByRole("heading", { name: "Composição 1/5" })).toBeVisible();
});

test("limpar exige confirmação e afeta somente o modo atual", async ({ page }) => {
  await page.goto("/?m=5&dg=hall-of-thanes&c=warrior-protection");
  const clear = page.getByRole("button", { name: "Limpar composição", exact: true });
  await clear.click();
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(clear).toBeFocused();
  await expect(page.getByRole("heading", { name: "Composição 1/5" })).toBeVisible();
  await clear.click();
  await page.getByRole("button", { name: "Confirmar limpeza", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Composição 0/5" })).toBeVisible();
  await expect(clear).toBeDisabled();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Composição 0/5" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Dungeon", exact: true })).toHaveValue("hall-of-thanes");
});
