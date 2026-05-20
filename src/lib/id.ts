export function newId(): string {
  // crypto.randomUUID は localhost / file 以外でも全モダンブラウザで利用可能。
  // 念のためフォールバックを用意。
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}
