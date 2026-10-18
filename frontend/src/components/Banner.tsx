import { useEffect, useRef } from "react";

interface Props {
    text_en: string;
    text_fi: string;
    btn_no: string;
    btn_yes: string
    onCancel: () => void;
    onConfirm: () => void;
}

export default function Banner(props: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    
    const banner = dialogRef.current;
    
    useEffect(() => {
        const banner = dialogRef.current;
        banner?.showModal();
            
        return () => banner?.close();
      }, []);
    
    return (
      <>
        <dialog
            ref={dialogRef}
            aria-labelledby="banner-title"
            className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-gray-200 bg-white p-0 text-gray-900 shadow-xl backdrop:bg-black/50"
        >
        <div className="flex p-6 text-justify">
            <p>
                {props.text_en}
            </p>
        </div>
        <div className="flex p-6 text-justify">
            <p>
                {props.text_fi}
            </p>
        </div>
        <div className="flex p-2 justify-center">
            <button onClick={() => { banner?.close(); props.onCancel();  }} className="mx-4 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500">{props.btn_no}</button>
            <button onClick={() => { banner?.close(); props.onConfirm(); }} className="mx-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">{props.btn_yes}</button>
        </div>
        </dialog>
      </>  
    );
}