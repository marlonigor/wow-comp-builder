import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { getCoverage, rankSpecs } from "./compEngine.ts";
import type { Coverage, CoverageContext, CoverageMember } from "./compEngine.ts";
import { assignFirstSlot, assignSlotAt, findFirstSlot, slotRoleLabel } from "./compositionSlots.ts";
import { findSpec, foreverCatalog } from "./data/foreverCatalog.ts";
import type { SpecDefinition } from "./data/forever-data.schema.ts";
import { emptyComposition, groupSizes, loadComposition, saveComposition } from "./browserComposition.ts";
import type { CompositionLink } from "./compositionLink.ts";
import { CommandBar } from "./CommandBar.tsx";
import { searchSpecs } from "./commandSearch.ts";
import { SpecSlotChoice } from "./SpecSlotChoice.tsx";
import type { SlotChoices } from "./SpecSlotChoice.tsx";
import { Roster } from "./Roster.tsx";
import { CoveragePanel } from "./CoveragePanel.tsx";
import "./style.css";

function MissionHeader(): React.JSX.Element {
  return (
    <header className="mission">
      <div className="crest" aria-hidden="true">
        <span>WF</span>
      </div>
      <div className="mission-copy">
        <p className="eyebrow">Mesa tática · WoW Forever</p>
        <h1>Comp Builder</h1>
        <p>Monte o grupo e acompanhe os utilitários que faltam.</p>
      </div>
    </header>
  );
}

function coverageContext(composition: CompositionLink): CoverageContext {
  if (composition.size === 5) {
    const dungeon = foreverCatalog.dungeons.find(({ id }) => id === composition.dungeonId);
    if (!dungeon) throw new Error("Perfil esperado no catálogo Forever: " + composition.dungeonId);
    return { mode: "DUNGEON_5", dungeon };
  }
  return { mode: `RAID_${composition.size}` };
}

interface BoardProps {
  composition: CompositionLink;
  onChange: (composition: CompositionLink) => void;
}

interface BoardState {
  selected: readonly string[];
  status: string;
  query: string;
  previewIndex: number | null;
  setSelected: (selected: readonly string[]) => void;
  setStatus: (status: string) => void;
  setQuery: (query: string) => void;
  setPreviewIndex: (index: number | null) => void;
}

function useBoardState(): BoardState {
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  return { selected, status, query, previewIndex, setSelected, setStatus, setQuery, setPreviewIndex };
}

interface BoardActions {
  add: (spec: SpecDefinition, targetIndex?: number) => boolean;
  remove: (index: number) => void;
  toggle: (id: string) => void;
}

function addToBoard({ composition, onChange }: BoardProps, state: BoardState, spec: SpecDefinition, index?: number): boolean {
  const slots = index === undefined ? assignFirstSlot(composition.slots, spec) : assignSlotAt(composition.slots, spec, index);
  if (!slots) {
    state.setStatus(`Sem vaga de ${slotRoleLabel(spec.role)} para ${spec.specName}. Libere uma vaga dessa função para adicionar.`);
    return false;
  }
  state.setSelected(state.selected.filter((id) => !spec.utilities.includes(id)));
  state.setPreviewIndex(null);
  onChange({ ...composition, slots });
  state.setQuery("");
  state.setStatus(`${spec.specName} entrou no grupo.`);
  return true;
}

function boardActions(props: BoardProps, state: BoardState): BoardActions {
  function remove(index: number): void {
    const slots = props.composition.slots.map((slot, position) => (position === index ? { ...slot, specId: null } : slot));
    props.onChange({ ...props.composition, slots });
    state.setStatus(`Vaga ${index + 1} liberada.`);
  }
  function toggle(id: string): void {
    const { selected } = state;
    state.setSelected(selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id]);
  }
  return { add: (spec, index) => addToBoard(props, state, spec, index), remove, toggle };
}

interface PaletteProps {
  state: BoardState;
  choices: SlotChoices;
  coverage: Coverage;
  add: BoardActions["add"];
}

interface SpecResultsProps {
  ranked: ReturnType<typeof rankSpecs>;
  choices: SlotChoices;
  add: BoardActions["add"];
}

function SpecResultCards({ ranked, choices, add }: SpecResultsProps): React.JSX.Element {
  if (ranked.length === 0) return <p>Nenhuma especialização disponível para esta busca e as vagas livres.</p>;
  return (
    <div className="options">
      {ranked.slice(0, 6).map(({ spec, score, matchCount }) => (
        <SpecSlotChoice key={spec.id} spec={spec} choices={choices} onSelect={add}>
          {score > 0 && <small className="score">{score} críticos cobertos</small>}
          {matchCount > 0 && <small>{matchCount} prioridades atendidas</small>}
        </SpecSlotChoice>
      ))}
    </div>
  );
}

function SpecResults(props: SpecResultsProps & { expanded: boolean }): React.JSX.Element {
  if (props.expanded) return <SpecResultCards {...props} />;
  return (
    <details className="suggestions">
      <summary>Sugestões compatíveis ({Math.min(props.ranked.length, 6)})</summary>
      <SpecResultCards {...props} />
    </details>
  );
}

interface PaletteActions {
  change: (value: string) => void;
  submit: () => void;
}

function paletteActions({ state, add }: PaletteProps, candidates: readonly SpecDefinition[]): PaletteActions {
  function change(value: string): void {
    state.setQuery(value);
    state.setStatus("");
  }
  function submit(): void {
    const [candidate] = candidates;
    if (state.query.trim() && candidates.length === 1 && candidate) {
      add(candidate);
      return;
    }
    state.setStatus(
      candidates.length === 0
        ? "Nenhum resultado. Tente um atalho como rdruid."
        : "Digite um atalho único, como rdruid, ou escolha uma especialização na lista.",
    );
  }
  return { change, submit };
}

function Palette(props: PaletteProps): React.JSX.Element {
  const { state, choices, coverage, add } = props;
  const candidates = searchSpecs(state.query, foreverCatalog.specs, foreverCatalog.utilities);
  const ranked = rankSpecs(candidates, coverage.missingCritical, state.selected).filter(
    ({ spec }) => findFirstSlot(choices.slots, spec.role) >= 0,
  );
  if (choices.slots.every(({ specId }) => specId)) return <CompleteGroup />;
  return (
    <section className="panel palette-panel">
      <h2>Adicionar ao grupo</h2>
      <PaletteCommand props={props} candidates={candidates} />
      <SpecResults ranked={ranked} choices={choices} add={add} expanded={Boolean(state.query.trim() || state.selected.length)} />
    </section>
  );
}

function PaletteCommand({ props, candidates }: { props: PaletteProps; candidates: readonly SpecDefinition[] }): React.JSX.Element {
  const { change, submit } = paletteActions(props, candidates);
  return (
    <CommandBar
      query={props.state.query}
      specs={foreverCatalog.specs}
      onSpecSelect={props.add}
      choices={props.choices}
      onQueryChange={change}
      onSubmit={submit}
    />
  );
}

function CompleteGroup(): React.JSX.Element {
  return (
    <section className="panel palette-panel complete-group">
      <h2>Grupo completo</h2>
      <p>Confira a cobertura tática. Para mudar um integrante, remova-o da composição e escolha outro na vaga liberada.</p>
    </section>
  );
}

function occupiedMembers(composition: CompositionLink): CoverageMember[] {
  return composition.slots.flatMap(({ specId }, index) => {
    const spec = findSpec(specId ?? "");
    return spec ? [{ slotNumber: index + 1, spec }] : [];
  });
}

function boardCoverage(group: readonly CoverageMember[], context: CoverageContext): Coverage {
  const groupSpecs = group.map(({ spec }) => spec);
  return getCoverage(foreverCatalog.utilities, groupSpecs, context);
}

function Board(props: BoardProps): React.JSX.Element {
  const { composition } = props;
  const state = useBoardState();
  const { add, remove, toggle } = boardActions(props, state);
  const group = occupiedMembers(composition);
  const context = coverageContext(composition);
  const coverage = boardCoverage(group, context);
  return (
    <>
      <BoardStatus status={state.status} />
      <div className="board">
        <Palette state={state} choices={{ slots: composition.slots, onPreview: state.setPreviewIndex }} coverage={coverage} add={add} />
        <Roster slots={composition.slots} previewIndex={state.previewIndex} coverage={coverage} onRemove={remove} onAssign={add} />
        <div className="side">
          <CoveragePanel context={context} coverage={coverage} group={group} selected={state.selected} toggle={toggle} />
        </div>
      </div>
    </>
  );
}

function BoardStatus({ status }: { status: string }): React.JSX.Element {
  return (
    <p className="status" role="status">
      {status}
    </p>
  );
}

function ModeSelect({ composition, onChange }: BoardProps): React.JSX.Element {
  function change(value: string): void {
    const size = groupSizes.find((size) => String(size) === value);
    if (size) onChange(emptyComposition(size));
  }
  return (
    <label>
      Modo
      <select value={composition.size} onChange={(event) => change(event.target.value)}>
        {groupSizes.map((size) => (
          <option key={size} value={size}>
            {size === 5 ? "Dungeon" : "Raid"} · {size} jogadores
          </option>
        ))}
      </select>
    </label>
  );
}

function DungeonSelect({ composition, onChange }: BoardProps): React.JSX.Element | null {
  if (composition.size !== 5) return null;
  return (
    <label>
      Dungeon
      <select value={composition.dungeonId} onChange={(event) => onChange({ ...composition, dungeonId: event.target.value })}>
        {foreverCatalog.dungeons.map(({ id, name }) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}

function App(): React.JSX.Element {
  const [composition, onChange] = useState(() => loadComposition(window));
  useEffect(() => saveComposition(window, composition), [composition]);
  return (
    <main>
      <MissionHeader />
      <p className="catalog-note">Catálogo inicial · {foreverCatalog.patchVersion}. A cobertura reflete os dados já verificados.</p>
      <div className="controls">
        <ModeSelect composition={composition} onChange={onChange} />
        <DungeonSelect composition={composition} onChange={onChange} />
      </div>
      <p>O endereço da página acompanha o grupo. Copie-o para compartilhar sua composição.</p>
      <Board key={`${composition.size}:${composition.dungeonId}`} composition={composition} onChange={onChange} />
    </main>
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<App />);
