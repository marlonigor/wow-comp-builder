const classIcons = import.meta.glob<string>("./assets/classes/*.jpg", { eager: true, query: "?url", import: "default" });
const specIcons = import.meta.glob<string>("./assets/specs/*.jpg", { eager: true, query: "?url", import: "default" });

/** Exibe o ícone de uma classe do catálogo. Exemplo: <ClassIcon name="Druid" />. */
export function ClassIcon({ name }: { name: string }): React.JSX.Element | null {
  const icon = classIcons[`./assets/classes/${name.toLowerCase()}.jpg`];
  return icon ? <img className="class-icon" src={icon} alt="" width={28} height={28} /> : null;
}

/** Exibe o ícone de uma especialização. Exemplo: <SpecIcon id="mage-frost" />. */
export function SpecIcon({ id }: { id: string }): React.JSX.Element | null {
  const icon = specIcons[`./assets/specs/${id}.jpg`];
  return icon ? <img className="class-icon" src={icon} alt="" width={28} height={28} /> : null;
}
