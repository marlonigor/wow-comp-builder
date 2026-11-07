import { useId } from "react";
import type { ReactNode } from "react";
import { ClassIcon } from "./ClassIcon.tsx";
import type { SpecDefinition } from "./data/forever-data.schema.ts";
import { SpecSlotChoice } from "./SpecSlotChoice.tsx";
import type { SlotChoices } from "./SpecSlotChoice.tsx";

interface ClassPickerProps {
  specs: readonly SpecDefinition[];
  className: string | null;
  onClassChange: (className: string | null) => void;
  onSpecSelect: (spec: SpecDefinition) => void;
  choices: SlotChoices;
  focusFirstClass?: boolean;
  renderDetails?: (spec: SpecDefinition) => ReactNode;
}

function ClassOptions({ specs, onClassChange, focusFirstClass }: ClassPickerProps): React.JSX.Element {
  const classes = [...new Set(specs.map((spec) => spec.className))].sort();
  return (
    <div className="class-options">
      {classes.map((name, index) => (
        <button
          className="class-option"
          type="button"
          key={name}
          autoFocus={focusFirstClass && index === 0}
          onClick={() => onClassChange(name)}
        >
          <ClassIcon name={name} />
          <span>{name}</span>
        </button>
      ))}
    </div>
  );
}

function SpecOptions({ specs, className, choices, onSpecSelect, onClassChange, renderDetails }: ClassPickerProps): React.JSX.Element {
  const matching = specs.filter((spec) => spec.className === className);
  return (
    <div className="class-options">
      {matching.map((spec, index) => (
        <SpecSlotChoice key={spec.id} spec={spec} choices={choices} autoFocus={index === 0} onSelect={onSpecSelect}>
          {renderDetails?.(spec)}
        </SpecSlotChoice>
      ))}
      <button type="button" onClick={() => onClassChange(null)}>
        Voltar às classes
      </button>
    </div>
  );
}

/** Mostra as classes ou suas especializações. Exemplo: <ClassPicker {...props} />. */
export function ClassPicker(props: ClassPickerProps): React.JSX.Element {
  const titleId = useId();
  const { className } = props;
  return (
    <section className="class-picker" aria-labelledby={titleId}>
      <h3 id={titleId}>{className ? `Qual especialização de ${className}?` : "Escolha uma classe"}</h3>
      {className ? <SpecOptions key={className} {...props} /> : <ClassOptions {...props} />}
    </section>
  );
}
