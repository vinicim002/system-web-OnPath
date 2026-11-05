/** Situação da permissão de notificação do navegador. */
export type Permissao = NotificationPermission | "sem_suporte";

export function lerPermissao(): Permissao {
  return typeof Notification === "undefined" ? "sem_suporte" : Notification.permission;
}

/** Pede a permissão só quando ainda não foi respondida. Precisa vir de um clique do usuário. */
export async function pedirPermissao(): Promise<Permissao> {
  const atual = lerPermissao();
  if (atual !== "default") return atual;
  try {
    return await Notification.requestPermission();
  } catch {
    return lerPermissao();
  }
}
