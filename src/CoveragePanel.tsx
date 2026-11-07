import { useId } from "react";
import { getDungeonCriticalIds, getUtilityProviders } from "./compEngine.ts";
import type { Coverage, CoverageContext, CoverageMember } from "./compEngine.ts";
import { foreverCatalog } from "./data/foreverCatalog.ts";
import type { UtilityDefinition } from "./data/forever-data.schema.ts";

interface CoveragePanelProps {
  context: CoverageContext;
  coverage: Coverage;
  group: readonly CoverageMember[];
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
  if (coverage.missingBonus.includes(id)) return <p>Opcional não coberto · {name}</p>;
  const providers = getUtilityProviders(group, id);
  return providers.length > 0 ? <CoveredUtility name={name} providers={providers} /> : null;
}

function CoveredUtility({ name, providers }: { name: string; providers: readonly CoverageMember[] }): React.JSX.Element {
  const titleId = useId();
  return (
    <div className="coverage-covered" role="group" aria-labelledby={titleId}>
      <span id={titleId}>Coberto · {name}</span>
      <ul className="coverage-providers" aria-label="Fornecido por">
        {providers.map(({ slotNumber, spec }) => (
          <li key={slotNumber}>
            Vaga {slotNumber} · {spec.specName} {spec.className}
          </li>
        ))}
      </ul>
    </div>
  );
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
  if (entries.length === 0)
    return <p className="catalog-note">Esta masmorra usa o perfil geral; requisitos próprios ainda não foram verificados.</p>;
  return (
    <section className="dungeon-coverage" aria-labelledby={title}>
      <p className="eyebrow">Específicos da masmorra</p>
      <h3 id={title}>{context.dungeon.name}</h3>
      <CoverageRows entries={entries} props={props} />
    </section>
  );
}

function CoverageDisclosure({ entries, props, title }: CoverageRowsProps & { title: string }): React.JSX.Element | null {
  if (entries.length === 0) return null;
  return (
    <details className="coverage-disclosure">
      <summary>
        {title} ({entries.length})
      </summary>
      <CoverageRows entries={entries} props={props} />
    </details>
  );
}

function GeneralCoverage({ entries, props }: CoverageRowsProps): React.JSX.Element {
  const critical = entries.filter(({ id }) => props.coverage.missingCritical.includes(id));
  const bonus = entries.filter(({ id }) => props.coverage.missingBonus.includes(id));
  const covered = entries.filter(({ id }) => getUtilityProviders(props.group, id).length > 0);
  return (
    <>
      {critical.length > 0 ? <CoverageRows entries={critical} props={props} /> : <p>Sem pendências críticas gerais.</p>}
      <CoverageDisclosure entries={covered} props={props} title="Cobertos" />
      <CoverageDisclosure entries={bonus} props={props} title="Opcionais não cobertos" />
    </>
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
      <GeneralCoverage entries={general} props={props} />
    </section>
  );
}
