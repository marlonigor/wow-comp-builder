import { expect, test } from "@playwright/test";

test("o utilitário da masmorra aparece separado e muda para coberto", async ({ page }) => {
  await page.goto("/?m=5&dg=ruins-of-lordaeron&c=");
  const dungeon = page.getByRole("region", { name: "Ruins of Lordaeron" });
  const poisonAlert = dungeon.getByRole("button", { name: "Falta crítica · Remoção de veneno" });
  await expect(poisonAlert).toBeVisible();
  await expect(page.getByRole("button", { name: "Falta crítica · Remoção de veneno" })).toHaveCount(1);

  await poisonAlert.click();
  await expect(poisonAlert).toHaveAttribute("aria-pressed", "true");
  const druid = page.getByRole("button", { name: /Restoration Druid.*selecionados/ });
  await expect(druid).toBeVisible();
  await druid.click();

  const covered = dungeon.getByRole("group", { name: "Coberto · Remoção de veneno" });
  await expect(covered).toBeVisible();
  await expect(covered).toHaveClass("coverage-covered");
  await expect(covered.getByRole("listitem")).toHaveText(["Vaga 2 · Restoration Druid"]);
  await expect(poisonAlert).toHaveCount(0);
  await expect(page.getByRole("group", { name: "Coberto · Remoção de veneno" })).toHaveCount(1);
});

test("a cobertura identifica vagas repetidas e atualiza os fornecedores ao remover", async ({ page }) => {
  await page.goto("/?m=5&dg=ruins-of-lordaeron&c=%2C%2Cdruid-balance%2Cdruid-balance");
  const dungeon = page.getByRole("region", { name: "Ruins of Lordaeron" });
  const providers = dungeon.getByRole("group", { name: "Coberto · Remoção de veneno" }).getByRole("listitem");
  await expect(providers).toHaveText(["Vaga 3 · Balance Druid", "Vaga 4 · Balance Druid"]);

  await page.getByRole("button", { name: "Remover Balance da vaga 3" }).click();
  await expect(providers).toHaveText(["Vaga 4 · Balance Druid"]);

  await page.getByRole("button", { name: "Remover Balance da vaga 4" }).click();
  await expect(dungeon.getByRole("button", { name: "Falta crítica · Remoção de veneno" })).toBeVisible();
});

test("a masmorra sem regras próprias informa que usa o perfil geral", async ({ page }) => {
  await page.goto("/?m=5&dg=razorfen-kraul&c=");
  const dungeon = page.getByRole("region", { name: "Razorfen Kraul" });
  await expect(dungeon.getByText("O catálogo ainda usa o perfil geral para esta masmorra.")).toBeVisible();
  await expect(dungeon.getByRole("button")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Cobertura geral" })).toBeVisible();
});
