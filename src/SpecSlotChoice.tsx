import type { ReactNode } from "react";
import { SpecIcon } from "./ClassIcon.tsx";
import { findFirstSlot, isOpenSlotAt, slotRoleLabel } from "./compositionSlots.ts";
import type { CompositionSlot } from "./compositionSlots.ts";
import type { SpecDefinition } from "./data/forever-data.schema.ts";

export interface SlotChoices {
  slots: readonly CompositionSlot[];
  onPreview?: (index: number | null) => void;
  targetIndex?: number;
}

interface SpecSlotChoiceProps {
  spec: SpecDefinition;
  choices: SlotChoices;
  onSelect: (spec: SpecDefinition) => void;
  autoFocus?: boolean;
  children?: ReactNode;
}

interface ChoiceAttributes {
  index: number;
  available: boolean;
  events: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

function choiceAttributes({ spec, choices, onSelect, autoFocus }: SpecSlotChoiceProps): ChoiceAttributes {
  const index = choices.targetIndex ?? findFirstSlot(choices.slots, spec.role);
  const available = isOpenSlotAt(choices.slots, index, spec.role);
  const preview = (): void => choices.onPreview?.(available ? index : null);
  const clear = (): void => choices.onPreview?.(null);
  const select = (): void => selectAvailable(available, spec, onSelect);
  return {
    index,
    available,
    events: {
      autoFocus,
      "aria-disabled": !available,
      onPointerEnter: preview,
      onPointerLeave: clear,
      onFocus: preview,
      onBlur: clear,
      onClick: select,
    },
  };
}

function selectAvailable(available: boolean, spec: SpecDefinition, onSelect: SpecSlotChoiceProps["onSelect"]): void {
  if (available) onSelect(spec);
}

/** Exibe a vaga disponível e impede seleção incompatível. Exemplo: <SpecSlotChoice {...props} />. */
export function SpecSlotChoice(props: SpecSlotChoiceProps): React.JSX.Element {
  const { spec, children } = props;
  const { index, available, events } = choiceAttributes(props);
  return (
    <button type="button" className="spec slot-choice" {...events}>
      <span>
        <span className="roster-spec">
          <SpecIcon id={spec.id} />
          {spec.specName}
        </span>
        <small className="spec-class">{spec.className}</small>
        <small className="slot-choice-label">
          {slotRoleLabel(spec.role)} · {available ? `Vaga ${index + 1}` : "Sem vaga livre"}
        </small>
      </span>
      {children}
    </button>
  );
}
