import { useEffect, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent as ReactKeyboardEvent, RefObject, SubmitEvent } from "react";
import { ClassPicker } from "./ClassPicker.tsx";
import type { SpecDefinition } from "./data/forever-data.schema.ts";
import type { SlotChoices } from "./SpecSlotChoice.tsx";

interface CommandBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  specs: readonly SpecDefinition[];
  onSpecSelect: (spec: SpecDefinition) => boolean;
  choices: SlotChoices;
}

function shouldFocusCommand(event: KeyboardEvent): boolean {
  if (event.key !== "/" || event.defaultPrevented || event.isComposing) return false;
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return false;
  const target = event.target;
  return !(target instanceof HTMLElement && (target.isContentEditable || target.closest("input, textarea, select, [role='textbox']")));
}

function useCommandShortcut(input: RefObject<HTMLInputElement | null>): void {
  useEffect(() => {
    function focusCommand(event: KeyboardEvent): void {
      if (!shouldFocusCommand(event)) return;
      event.preventDefault();
      input.current?.focus();
    }
    window.addEventListener("keydown", focusCommand);
    return () => window.removeEventListener("keydown", focusCommand);
  }, [input]);
}

interface Picker {
  input: RefObject<HTMLInputElement | null>;
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedClass: string | null;
  close: () => void;
  changeClass: (name: string | null) => void;
}

function usePicker(choices: SlotChoices): Picker {
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  useCommandShortcut(input);
  function close(): void {
    choices.onPreview?.(null);
    setOpen(false);
    setSelectedClass(null);
  }
  function changeClass(name: string | null): void {
    choices.onPreview?.(null);
    setSelectedClass(name);
    if (name === null) input.current?.focus();
  }
  return { input, open, setOpen, selectedClass, close, changeClass };
}

interface FormEvents {
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  onBlur: (event: FocusEvent<HTMLFormElement>) => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLFormElement>) => void;
}

function useFormEvents(props: CommandBarProps, picker: Picker): FormEvents {
  function onSubmit(event: SubmitEvent<HTMLFormElement>): void {
    event.preventDefault();
    picker.close();
    props.onSubmit();
  }
  function onBlur(event: FocusEvent<HTMLFormElement>): void {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) picker.close();
  }
  function onKeyDown(event: ReactKeyboardEvent<HTMLFormElement>): void {
    if (event.key !== "Escape" || !picker.open) return;
    picker.input.current?.focus();
    picker.close();
  }
  return { onSubmit, onBlur, onKeyDown };
}

function CommandField({ props, picker }: { props: CommandBarProps; picker: Picker }): React.JSX.Element {
  const open = (): void => picker.setOpen(true);
  const change = commandChange(props, picker);
  return (
    <div className="command-input">
      <input
        id="spec-command"
        ref={picker.input}
        value={props.query}
        autoComplete="off"
        aria-describedby="command-hint"
        onFocus={open}
        onClick={open}
        onChange={(event) => change(event.target.value)}
      />
      <button type="submit">Adicionar</button>
    </div>
  );
}

function commandChange(props: CommandBarProps, picker: Picker): (value: string) => void {
  return (value) => {
    picker.close();
    props.onQueryChange(value);
  };
}

function CommandClassPicker({ props, picker }: { props: CommandBarProps; picker: Picker }): React.JSX.Element | null {
  if (!picker.open) return null;
  function choose(spec: SpecDefinition): void {
    if (!props.onSpecSelect(spec)) return;
    picker.input.current?.focus();
    picker.close();
  }
  return (
    <ClassPicker
      specs={props.specs}
      className={picker.selectedClass}
      choices={props.choices}
      onSpecSelect={choose}
      onClassChange={picker.changeClass}
    />
  );
}

/** Renderiza a busca e registra o atalho. Exemplo: <CommandBar {...props} />. */
export function CommandBar(props: CommandBarProps): React.JSX.Element {
  const picker = usePicker(props.choices);
  return (
    <form className="command-bar" {...useFormEvents(props, picker)}>
      <label htmlFor="spec-command">
        Buscar especialização <kbd>/</kbd>
      </label>
      <CommandField props={props} picker={picker} />
      <CommandClassPicker props={props} picker={picker} />
      <small id="command-hint">Exemplo: rdruid. Pressione Enter para adicionar um resultado único.</small>
    </form>
  );
}
