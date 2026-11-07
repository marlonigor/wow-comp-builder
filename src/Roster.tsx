import { useRef, useState } from "react";
import type { MouseEvent, RefObject } from "react";
import { ClassIcon, SpecIcon } from "./ClassIcon.tsx";
import type { Coverage } from "./compEngine.ts";
import { slotRoleLabel } from "./compositionSlots.ts";
import type { CompositionSlot } from "./compositionSlots.ts";
import { findSpec, foreverCatalog } from "./data/foreverCatalog.ts";
import type { SpecDefinition } from "./data/forever-data.schema.ts";
import { SlotPicker } from "./SlotPicker.tsx";

interface RosterProps {
  slots: readonly CompositionSlot[];
  previewIndex: number | null;
  coverage: Coverage;
  onRemove: (index: number) => void;
  onAssign: (spec: SpecDefinition, index: number) => boolean;
}

interface RosterPicker {
  activeIndex: number | null;
  heading: RefObject<HTMLHeadingElement | null>;
  open: (index: number, button: HTMLButtonElement) => void;
  close: (assigned: boolean) => void;
}

function useRosterPicker(slots: readonly CompositionSlot[]): RosterPicker {
  const [target, setTarget] = useState<number | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const activeIndex = target !== null && slots[target]?.specId === null ? target : null;
  function open(index: number, button: HTMLButtonElement): void {
    trigger.current = button;
    setTarget(index);
  }
  function close(assigned: boolean): void {
    setTarget(null);
    (assigned ? heading.current : trigger.current)?.focus();
  }
  return { activeIndex, heading, open, close };
}

interface RosterSlotProps {
  slot: CompositionSlot;
  index: number;
  picker: RosterPicker;
  isTarget: boolean;
  onRemove: RosterProps["onRemove"];
}

function OpenSlotButton({ slot, index, picker }: RosterSlotProps): React.JSX.Element {
  function open(event: MouseEvent<HTMLButtonElement>): void {
    picker.open(index, event.currentTarget);
  }
  return (
    <button
      type="button"
      aria-expanded={picker.activeIndex === index}
      onClick={open}
      aria-label={`Adicionar na vaga ${index + 1} de ${slotRoleLabel(slot.role)}`}
    >
      Vaga livre
    </button>
  );
}

function SlotButton(props: RosterSlotProps): React.JSX.Element {
  const { slot, index, onRemove } = props;
  if (!slot.specId) return <OpenSlotButton {...props} />;
  return (
    <button onClick={() => onRemove(index)} aria-label={`Remover ${findSpec(slot.specId)?.specName} da vaga ${index + 1}`}>
      Remover
    </button>
  );
}

function RosterSlot(props: RosterSlotProps): React.JSX.Element {
  const { slot, index, isTarget } = props;
  const spec = slot.specId ? findSpec(slot.specId) : undefined;
  return (
    <li data-role={slot.role} data-target={isTarget}>
      <span>
        <small className="slot-role">
          Vaga {index + 1} · {slotRoleLabel(slot.role)}
        </small>
        {spec && <RosterSpec spec={spec} />}
        {isTarget && <small className="slot-target-label">Destino da seleção</small>}
      </span>
      <SlotButton {...props} />
    </li>
  );
}

function RosterSpec({ spec }: { spec: SpecDefinition }): React.JSX.Element {
  return (
    <span className="roster-spec">
      <ClassIcon name={spec.className} />
      <SpecIcon id={spec.id} />
      <strong>{spec.specName}</strong>
    </span>
  );
}

function RosterSlots({ props, picker }: { props: RosterProps; picker: RosterPicker }): React.JSX.Element {
  const { slots, previewIndex, onRemove } = props;
  const target = picker.activeIndex ?? previewIndex;
  return (
    <ol className={slots.length === 5 ? "roster party-slots" : "roster"}>
      {slots.map((slot, index) => (
        <RosterSlot key={index} slot={slot} index={index} picker={picker} isTarget={target === index} onRemove={onRemove} />
      ))}
    </ol>
  );
}

function ActiveSlotPicker({ props, picker }: { props: RosterProps; picker: RosterPicker }): React.JSX.Element | null {
  const index = picker.activeIndex;
  if (index === null) return null;
  return (
    <SlotPicker
      key={index}
      index={index}
      specs={foreverCatalog.specs}
      utilities={foreverCatalog.utilities}
      coverage={props.coverage}
      choices={{ slots: props.slots }}
      onSelect={props.onAssign}
      onClose={picker.close}
    />
  );
}

/** Exibe as vagas e o seletor. Exemplo: <Roster {...props} />. */
export function Roster(props: RosterProps): React.JSX.Element {
  const picker = useRosterPicker(props.slots);
  const filled = props.slots.filter(({ specId }) => specId).length;
  return (
    <section className="panel">
      <h2 ref={picker.heading} tabIndex={-1}>
        Composição{" "}
        <small>
          {filled}/{props.slots.length}
        </small>
      </h2>
      <RosterSlots props={props} picker={picker} />
      <ActiveSlotPicker props={props} picker={picker} />
    </section>
  );
}
