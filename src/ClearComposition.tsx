import { useRef } from "react";
import type { RefObject } from "react";

interface ClearCompositionProps {
  disabled: boolean;
  onClear: () => void;
}

function ClearDialog({ dialog, onClear }: { dialog: RefObject<HTMLDialogElement | null>; onClear: () => void }): React.JSX.Element {
  function confirm(): void {
    dialog.current?.close();
    onClear();
  }
  return (
    <dialog ref={dialog} className="slot-dialog" aria-labelledby="clear-title" aria-describedby="clear-description">
      <h2 id="clear-title">Limpar este grupo?</h2>
      <p id="clear-description">
        Todos os integrantes deste modo serão removidos. A masmorra e os grupos dos outros modos serão preservados.
      </p>
      <ClearActions cancel={() => dialog.current?.close()} confirm={confirm} />
    </dialog>
  );
}

function ClearActions({ cancel, confirm }: { cancel: () => void; confirm: () => void }): React.JSX.Element {
  return (
    <div className="clear-actions">
      <button autoFocus onClick={cancel}>
        Cancelar
      </button>
      <button className="alert" onClick={confirm}>
        Confirmar limpeza
      </button>
    </div>
  );
}

/** Confirma a limpeza somente do modo ativo. Exemplo: <ClearComposition disabled={false} onClear={clear} />. */
export function ClearComposition({ disabled, onClear }: ClearCompositionProps): React.JSX.Element {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <div className="clear-control">
      <button disabled={disabled} onClick={() => dialog.current?.showModal()}>
        Limpar composição
      </button>
      <ClearDialog dialog={dialog} onClear={onClear} />
    </div>
  );
}
