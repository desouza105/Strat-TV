export type VerifyResult =
  | { ok: true; url: string }
  | { ok: false; reason: 'invalid' | 'unavailable' | 'rate_limited' | 'network' };

/** Demande au serveur de vérifier le code de la section protégée (rien n'est stocké dans le navigateur). */
export async function verifyProtectedCode(code: string): Promise<VerifyResult> {
  try {
    const res = await fetch('/api/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (res.ok) {
      const data = await res.json();
      return typeof data.url === 'string' ? { ok: true, url: data.url } : { ok: false, reason: 'unavailable' };
    }
    if (res.status === 401) return { ok: false, reason: 'invalid' };
    if (res.status === 429) return { ok: false, reason: 'rate_limited' };
    return { ok: false, reason: 'unavailable' };
  } catch {
    return { ok: false, reason: 'network' };
  }
}

export const VERIFY_MESSAGES: Record<Exclude<VerifyResult, { ok: true }>['reason'], string> = {
  invalid: 'Code invalide',
  unavailable: "Section non configurée sur ce serveur",
  rate_limited: 'Trop d’essais, réessaie plus tard',
  network: 'Connexion impossible',
};
