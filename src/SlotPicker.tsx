import { useEffect, useRef, useState } from "react";
import { ClassPicker } from "./ClassPicker.tsx";
import { getSpecCoverage } from "./compEngine.ts";
import type { Coverage } from "./compEngine.ts";
import { isSlotRoleCompatible, slotRoleLabel } from "./compositionSlots.ts";
import type { CompositionSlot } from "./compositionSlots.ts";
import type { SlotChoices } from "./SpecSlotChoice.tsx";
import type { SpecDefinition, UtilityDefinition } from "./data/forever-data.schema.ts";

interface SlotPickerProps {
  specs: readonly SpecDefinition[];
  choices: SlotChoices;
  index: number;
  coverage: Coverage;
  utilities: readonly UtilityDefinition[];
  onSelect: (spec: SpecDefinition, index: number) => boolean;
  onClose: (assigned: boolean) => void;
}

interface CoverageDetailsProps extends Pick<SlotPickerProps, "coverage" | "utilities"> {
  spec: SpecDefinition;
}

function CoverageDetails({ spec, coverage, utilities }: CoverageDetailsProps): React.JSX.Element {
  const { critical, bonus } = getSpecCoverage(spec, coverage, utilities);
  if (critical.length === 0 && bonus.length === 0) return <small>Sem cobertura adicional</small>;
  return (
    <small>
      {critical.length} críticos e {bonus.length} opcionais adicionais
    </small>
  );
}

function SlotClassPicker({ eligible, props }: { eligible: readonly SpecDefinition[]; props: SlotPickerProps }): React.JSX.Element {
  const [className, onClassChange] = useState<string | null>(null);
  const { choices, index, coverage, utilities, onSelect, onClose } = props;
  function choose(spec: SpecDefinition): void {
    if (onSelect(spec, index)) onClose(true);
  }
  if (eligible.length === 0) return <p>O catálogo ainda não tem especializações para esta função.</p>;
  return (
    <ClassPicker
      specs={eligible}
      className={className}
      focusFirstClass
      choices={{ ...choices, targetIndex: index }}
      onClassChange={onClassChange}
      onSpecSelect={choose}
      renderDetails={(spec) => <CoverageDetails spec={spec} coverage={coverage} utilities={utilities} />}
    />
  );
}

function SlotPickerHeading({ index, role }: { index: number; role: CompositionSlot["role"] }): React.JSX.Element {
  return (
    <h2>
      <strong>
        Vaga {index + 1} · {slotRoleLabel(role)}
      </strong>
    </h2>
  );
}

/** Filtra o seletor pela vaga escolhida. Exemplo: <SlotPicker {...props} />. */
function SlotPickerContent(props: SlotPickerProps): React.JSX.Element | null {
  const { specs, choices, index, onClose } = props;
  const slot = choices.slots[index];
  if (!slot || slot.specId !== null) return null;
  const eligible = specs.filter((spec) => isSlotRoleCompatible(slot, spec.role));
  return (
    <div className="slot-picker">
      <SlotPickerHeading index={index} role={slot.role} />
      <SlotClassPicker eligible={eligible} props={props} />
      <button type="button" autoFocus={eligible.length === 0} onClick={() => onClose(false)}>
        Fechar seletor
      </button>
    </div>
  );
}

/** Mantém a escolha junto ao contexto sem rolar a raid. Exemplo: <SlotPicker {...props} />. */
export function SlotPicker(props: SlotPickerProps): React.JSX.Element {
  const dialog = useRef<HTMLDialogElement>(null);
  const role = props.choices.slots[props.index]?.role ?? "DPS";
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="slot-dialog"
      aria-label={`Vaga ${props.index + 1} · ${slotRoleLabel(role)}`}
      onCancel={(event) => {
        event.preventDefault();
        closeSlotDialog(dialog.current, props, false);
      }}
    >
      <SlotPickerContent {...props} onClose={(assigned) => closeSlotDialog(dialog.current, props, assigned)} />
    </dialog>
  );
}

function closeSlotDialog(dialog: HTMLDialogElement | null, props: SlotPickerProps, assigned: boolean): void {
  // Libera o restante da página antes de devolver o foco à vaga de origem.
  dialog?.close();
  props.onClose(assigned);
}
