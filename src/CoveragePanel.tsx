import { useId } from "react";
import { getDungeonCriticalIds } from "./compEngine.ts";
import type { Coverage, CoverageContext } from "./compEngine.ts";
import { foreverCatalog } from "./data/foreverCatalog.ts";
import type { SpecDefinition, UtilityDefinition } from "./data/forever-data.schema.ts";

interface CoveragePanelProps {
  context: CoverageContext;
  coverage: Coverage;
  group: readonly SpecDefinition[];
  selected: readonly string[];
  toggle: (id: string) => void;
}

function CoverageEntry({
  id,
  name,
  coverage,
  group,
  selected,
  toggle,
}: CoveragePanelProps & Pick<UtilityDefinition, "id" | "name">): React.JSX.Element | null {
  if (coverage.missingCritical.includes(id)) {
    return (
      <button className="alert" aria-pressed={selected.includes(id)} onClick={() => toggle(id)}>
        Falta crítica · {name}
      </button>
    );
  }
  if (coverage.missingBonus.includes(id)) return <p>Bônus disponível · {name}</p>;
  return group.some(({ utilities }) => utilities.includes(id)) ? <p className="coverage-covered">Coberto · {name}</p> : null;
}

interface CoverageRowsProps {
  entries: readonly UtilityDefinition[];
  props: CoveragePanelProps;
}

function CoverageRows({ entries, props }: CoverageRowsProps): React.JSX.Element {
  return (
    <div className="options">
      {entries.map(({ id, name }) => (
        <CoverageEntry key={id} id={id} name={name} {...props} />
      ))}
    </div>
  );
}

function DungeonCoverage({ entries, props }: CoverageRowsProps): React.JSX.Element | null {
  const title = useId();
  const { context } = props;
  if (context.mode !== "DUNGEON_5" || context.dungeon.id === "general") return null;
  return (
    <section className="dungeon-coverage" aria-labelledby={title}>
      <p className="eyebrow">Específicos da masmorra</p>
      <h3 id={title}>{context.dungeon.name}</h3>
      {entries.length > 0 ? (
        <CoverageRows entries={entries} props={props} />
      ) : (
        <p>O catálogo ainda usa o perfil geral para esta masmorra.</p>
      )}
    </section>
  );
}

/** Exibe cobertura geral e requisitos locais. Exemplo: <CoveragePanel {...props} />. */
export function CoveragePanel(props: CoveragePanelProps): React.JSX.Element {
  const ids = getDungeonCriticalIds(
    props.context,
    foreverCatalog.dungeons.find(({ id }) => id === "general"),
  );
  const local = foreverCatalog.utilities.filter(({ id }) => ids.includes(id));
  const general = foreverCatalog.utilities.filter(({ id }) => !ids.includes(id));
  return (
    <section className="panel coverage-panel">
      <h2>Cobertura tática</h2>
      <p>Selecione um alerta para priorizar quem pode cobri-lo.</p>
      <DungeonCoverage entries={local} props={props} />
      <h3>Cobertura geral</h3>
      <CoverageRows entries={general} props={props} />
    </section>
  );
}
