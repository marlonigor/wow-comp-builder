import { expect, test } from "@playwright/test";
import "./ui-coverage.mjs";

test("grupo completo recolhe a busca e reabre ao liberar uma vaga", async ({ page }, testInfo) => {
  await page.goto("/?m=5&dg=general&c=warrior-protection,druid-restoration,mage-fire,mage-frost,mage-arcane");
  await expect(page.getByText("Grupo completo", { exact: true })).toBeVisible();
  await expect(page.getByRole("textbox")).toHaveCount(0);
  await expect(page.getByText("Vagas preenchidas", { exact: true })).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("grupo-completo.png"), fullPage: true });
  await page.getByRole("button", { name: "Remover Fire da vaga 3" }).click();
  await expect(page.getByRole("textbox")).toBeVisible();
  await page.getByText(/^Sugestões compatíveis/).click();
  await expect(page.getByRole("button", { name: /Sem vaga livre/ })).toHaveCount(0);
});

test("a busca aceita atalhos e explica buscas sem resultado ou sem vaga", async ({ page }) => {
  await page.goto("/?m=5&dg=general&c=");
  const search = page.getByRole("textbox");
  await search.fill("inexistente");
  await search.press("Enter");
  await expect(page.getByRole("status")).toContainText("Nenhum resultado");
  await search.fill("mage");
  await search.press("Enter");
  await expect(page.getByRole("status")).toContainText("Digite um atalho único");
  await search.fill("rdruid");
  await search.press("Enter");
  await expect(page.getByRole("heading", { name: "Composição 1/5" })).toBeVisible();
  await search.fill("rdruid");
  await search.press("Enter");
  await expect(page.getByRole("status")).toContainText("Sem vaga de Curador");
});

test("o diálogo permite voltar, preencher a vaga exata e devolver o foco", async ({ page }) => {
  await page.goto("/?m=5&dg=general&c=");
  await page.getByRole("button", { name: "Adicionar na vaga 4 de DPS" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Mage", exact: true }).click();
  await dialog.getByRole("button", { name: "Voltar às classes" }).click();
  await dialog.getByRole("button", { name: "Warrior", exact: true }).click();
  await expect(dialog.getByRole("button", { name: /Protection/ })).toHaveCount(0);
  await dialog.getByRole("button", { name: /^Arms Warrior/ }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Remover Arms da vaga 4" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Composição 1/5" })).toBeFocused();
});

test("cobertos e opcionais revelam detalhes sem esconder pendências", async ({ page }) => {
  await page.goto("/?m=5&dg=general&c=warrior-protection");
  await expect(page.getByRole("button", { name: "Falta crítica · Ressurreição em combate" })).toBeVisible();
  const covered = page.getByRole("group", { name: "Coberto · Interrupção curta", exact: true });
  await expect(covered).toBeHidden();
  await page.getByText(/^Cobertos \(/).click();
  await expect(covered).toBeVisible();
  await page.getByText(/^Opcionais não cobertos \(/).click();
  await expect(page.getByText("Opcional não coberto · Trueshot Aura", { exact: true })).toBeVisible();
});

test("seletor da primeira vaga de raid fica numa janela acessível no celular", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?m=40&c=");
  const trigger = page.getByRole("button", { name: "Adicionar na vaga 1 de Tanque" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Vaga 1 · Tanque" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Paladin", exact: true })).toBeInViewport();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
