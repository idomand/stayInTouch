import React, { useEffect, useRef } from "react";
import { Dialog, DialogHeader, DialogButton } from "./SafeCloseDialogStyle";
type SafeCloseDialogProps = {
  dialogText: string;
  openDialog: any;
  closeDialog: any;
  customFunction: any;
  children?: any;
};

export default function SafeCloseDialog({
  dialogText,
  openDialog,
  closeDialog,
  customFunction,
  children,
}: SafeCloseDialogProps) {
  const ref = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    console.log("openDialog :>> ", openDialog);
    if (openDialog) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [openDialog]);

  // Close dialog when clicking outside the content
  useEffect(() => {
    const dialog = ref.current;
    const handleClick = (e: Event) => {
      if (dialog && e.target === dialog) {
        closeDialog();
      }
    };
    dialog?.addEventListener("click", handleClick);
    return () => dialog?.removeEventListener("click", handleClick);
  }, [closeDialog]);

  return (
    openDialog && (
      <Dialog ref={ref} onCancel={closeDialog}>
        <DialogHeader>{dialogText}</DialogHeader>
        {children}
        <div>
          <DialogButton onClick={closeDialog}>close</DialogButton>
          <DialogButton onClick={customFunction}>submit</DialogButton>
        </div>
      </Dialog>
    )
  );
}
