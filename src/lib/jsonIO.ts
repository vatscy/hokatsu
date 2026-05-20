import type { Kindergarten } from '../types/kindergarten';

const APP_NAME = 'hokatsu';
const FORMAT_VERSION = 1;

export interface ExportPayload {
  appName: typeof APP_NAME;
  version: typeof FORMAT_VERSION;
  exportedAt: string;
  kindergartens: Kindergarten[];
}

export function buildExportPayload(records: Kindergarten[]): ExportPayload {
  return {
    appName: APP_NAME,
    version: FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    kindergartens: records,
  };
}

export function serializeExport(records: Kindergarten[]): string {
  return JSON.stringify(buildExportPayload(records), null, 2);
}

export class ImportFormatError extends Error {}

export function parseImport(text: string): Kindergarten[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new ImportFormatError('JSON として解釈できません');
  }
  if (!data || typeof data !== 'object') {
    throw new ImportFormatError('JSON のトップレベルがオブジェクトではありません');
  }
  const obj = data as Record<string, unknown>;
  if (obj.appName !== APP_NAME) {
    throw new ImportFormatError(`appName が "${APP_NAME}" ではありません`);
  }
  if (obj.version !== FORMAT_VERSION) {
    throw new ImportFormatError(
      `version ${FORMAT_VERSION} のみ対応です（受領: ${String(obj.version)}）`,
    );
  }
  if (!Array.isArray(obj.kindergartens)) {
    throw new ImportFormatError('kindergartens 配列がありません');
  }
  // 詳細フィールドのバリデーションは Phase 1 では行わない（Zod 等の導入は Phase 2 以降）。
  // 最小限の必須キーのみ確認。
  for (const k of obj.kindergartens) {
    if (!k || typeof k !== 'object') {
      throw new ImportFormatError('kindergartens の要素が不正です');
    }
    const rec = k as Record<string, unknown>;
    if (typeof rec.id !== 'string' || rec.id.length === 0) {
      throw new ImportFormatError('kindergartens の各要素に id (string) が必要です');
    }
    if (typeof rec.createdAt !== 'string' || typeof rec.updatedAt !== 'string') {
      throw new ImportFormatError(
        'kindergartens の各要素に createdAt / updatedAt (string) が必要です',
      );
    }
  }
  return obj.kindergartens as Kindergarten[];
}

export function downloadJsonFile(text: string, fileName: string): void {
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function defaultExportFileName(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `hokatsu-${y}${m}${d}.json`;
}
