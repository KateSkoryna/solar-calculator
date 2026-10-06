import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmDialog from "./ConfirmDialog";

function renderDialog(isConfirming = false) {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();
  render(
    <ConfirmDialog
      title="Delete Ford Transit?"
      text="It disappears from your lists."
      confirmLabel="Delete"
      cancelLabel="Cancel"
      isConfirming={isConfirming}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
  );
  return { onConfirm, onCancel };
}

describe("ConfirmDialog", () => {
  it("is a labelled dialog that starts with focus on Cancel", () => {
    renderDialog();

    expect(
      screen.getByRole("alertdialog", { name: "Delete Ford Transit?" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  });

  it("only confirms when the danger button is pressed", async () => {
    const { onConfirm, onCancel } = renderDialog();

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("cancels on Escape and on the Cancel button", async () => {
    const { onConfirm, onCancel } = renderDialog();

    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(2);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("keeps focus inside the dialog when tabbing", async () => {
    renderDialog();

    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Delete" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Delete" })).toHaveFocus();
  });

  it("ignores Escape while the confirmation is running", async () => {
    const { onCancel } = renderDialog(true);

    await userEvent.keyboard("{Escape}");

    expect(onCancel).not.toHaveBeenCalled();
  });
});
