interface DeleteAccountSteps {
  reauthenticate: () => Promise<void>;
  deleteRemotely: () => Promise<void>;
}

/** Garantiza que una reautenticación fallida nunca borre datos. */
export async function deleteAccountSafely(steps: DeleteAccountSteps): Promise<void> {
  await steps.reauthenticate();
  await steps.deleteRemotely();
}
