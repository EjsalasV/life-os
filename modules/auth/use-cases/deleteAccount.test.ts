import { describe, expect, it, vi } from "vitest";
import { deleteAccountSafely } from "./deleteAccount";

describe("deleteAccountSafely", () => {
  it("reauthenticates before deleting data and auth", async () => {
    const order: string[] = [];
    await deleteAccountSafely({
      reauthenticate: async () => { order.push("reauthenticate"); },
      deleteRemotely: async () => { order.push("remote"); }
    });
    expect(order).toEqual(["reauthenticate", "remote"]);
  });

  it("does not delete anything when reauthentication fails", async () => {
    const deleteRemotely = vi.fn();
    await expect(deleteAccountSafely({
      reauthenticate: async () => { throw new Error("invalid credential"); },
      deleteRemotely
    })).rejects.toThrow("invalid credential");
    expect(deleteRemotely).not.toHaveBeenCalled();
  });
});
