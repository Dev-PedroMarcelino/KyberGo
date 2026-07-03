/**
 * Modo suporte (impersonação): o super admin visualiza o painel de uma
 * empresa cliente. Em modo demo o estado vive no localStorage; em produção,
 * a impersonação deve ser emitida pelo backend como sessão auditada de
 * curta duração (registrada em audit_logs) e com acesso somente leitura.
 */

const STORAGE_KEY = "kybergo.impersonation";

export interface ImpersonationState {
  companyId: string;
  companyName: string;
  startedAt: string;
}

export function getImpersonation(): ImpersonationState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ImpersonationState) : null;
  } catch {
    return null;
  }
}

export function startImpersonation(companyId: string, companyName: string) {
  const state: ImpersonationState = {
    companyId,
    companyName,
    startedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function stopImpersonation() {
  window.localStorage.removeItem(STORAGE_KEY);
}
