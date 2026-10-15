import { useEffect, useRef } from "react";

interface Props {
  emoji: string | null; // if emoji === null, cancel button is not shown in the Dialog;
                        // the dialog is just "Ok Dialog"
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function Dialog({ emoji, title, message, onConfirm, onCancel }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();

    return () => dialog?.close();
  }, []);
  
  
  return (
    <>
      <dialog
        ref={dialogRef}
        aria-labelledby="dialog-title"
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-gray-200 bg-white p-0 text-gray-900 shadow-xl backdrop:bg-black/50"
      >
        <div className="p-6">
          <h2 id="dialog-title" className="text-lg font-semibold text-left">
            {title}
          </h2>
          <p className="mt-2 text-sm text-gray-600 text-center">
            {message}
          </p>
          {emoji && (
          <p className="mt-2 text-3xl text-center">
            {emoji}
          </p>
          )}
          <div className="mt-6 flex justify-center gap-3">
            {emoji !== null && (
              <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500">Cancel</button>
              )
            }
            <button type="button" onClick={onConfirm} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Ok</button>
          </div>
        </div>
      </dialog>
    </>
  );
}