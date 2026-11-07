import { expect, test } from "@playwright/test";

test("o utilitário da masmorra aparece separado e muda para coberto", async ({ page }) => {
  await page.goto("/?m=5&dg=ruins-of-lordaeron&c=");
  const dungeon = page.getByRole("region", { name: "Ruins of Lordaeron" });
  const poisonAlert = dungeon.getByRole("button", { name: "Falta crítica · Remoção de veneno" });
  await expect(poisonAlert).toBeVisible();
  await expect(page.getByText(/Remoção de veneno/, { exact: false })).toHaveCount(1);

  await poisonAlert.click();
  await expect(poisonAlert).toHaveAttribute("aria-pressed", "true");
  const druid = page.getByRole("button", { name: /Restoration Druid.*selecionados/ });
  await expect(druid).toBeVisible();
  await druid.click();

  const covered = dungeon.getByText("Coberto · Remoção de veneno", { exact: true });
  await expect(covered).toBeVisible();
  await expect(covered).toHaveClass("coverage-covered");
  await expect(poisonAlert).toHaveCount(0);
  await expect(page.getByText(/Remoção de veneno/, { exact: false })).toHaveCount(1);
});

test("a masmorra sem regras próprias informa que usa o perfil geral", async ({ page }) => {
  await page.goto("/?m=5&dg=razorfen-kraul&c=");
  const dungeon = page.getByRole("region", { name: "Razorfen Kraul" });
  await expect(dungeon.getByText("O catálogo ainda usa o perfil geral para esta masmorra.")).toBeVisible();
  await expect(dungeon.getByRole("button")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Cobertura geral" })).toBeVisible();
});
