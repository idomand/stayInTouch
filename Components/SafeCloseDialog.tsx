import { useEffect, useRef } from "react";
import styled from "styled-components";
import { H2 } from "./Common/StyledText";
import { BasicButton } from "./Common/StyledButton";

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

const Dialog = styled.dialog`
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: ${({ theme }) => theme.sizes.borderRadius};
`;

const DialogHeader = styled(H2)`
  margin-bottom: 50px;
`;

const DialogButton = styled(BasicButton)``;
