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

// ---- 共有文字列（deflate-raw 圧縮 + base64url）----

const SHARE_PREFIX = 'v1:';

// Chromium の (De)CompressionStream は readable を消費しないと writer.write/close が
// バックプレッシャで待ち続けるため、書き込みと並行して readable をドレインする必要がある。
// Node の実装ではこの問題が顕在化しないため Vitest だけでは検知できない。
async function deflateRaw(data: BufferSource): Promise<Uint8Array<ArrayBuffer>> {
  const cs = new CompressionStream('deflate-raw');
  return pipeThroughTransform(cs, data);
}

async function inflateRaw(data: BufferSource): Promise<Uint8Array<ArrayBuffer>> {
  const ds = new DecompressionStream('deflate-raw');
  return pipeThroughTransform(ds, data);
}

async function pipeThroughTransform(
  stream: CompressionStream | DecompressionStream,
  data: BufferSource,
): Promise<Uint8Array<ArrayBuffer>> {
  const writer = stream.writable.getWriter();
  // 不正データでストリームがエラーになると writer 側も reject するが、
  // 失敗の伝播は readable 側のみに任せ、writer の reject は unhandledRejection を
  // 出さないよう個別に握り潰す。
  const writeDone = (async () => {
    try {
      await writer.write(data);
      await writer.close();
    } catch {
      // readable 側の collectStream 内エラーとして拾わせる
    }
  })();
  const result = await collectStream(stream.readable);
  await writeDone;
  return result;
}

async function collectStream(readable: ReadableStream<Uint8Array>): Promise<Uint8Array<ArrayBuffer>> {
  const reader = readable.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const total = chunks.reduce((s, c) => s + c.length, 0);
  const out = new Uint8Array(new ArrayBuffer(total));
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

function bytesToBase64url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 8192) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlToBytes(str: string): Uint8Array<ArrayBuffer> {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4;
  if (pad === 2) b64 += '==';
  else if (pad === 3) b64 += '=';
  const binary = atob(b64);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function compressToShareString(records: Kindergarten[]): Promise<string> {
  const json = JSON.stringify(buildExportPayload(records));
  const compressed = await deflateRaw(new TextEncoder().encode(json));
  return SHARE_PREFIX + bytesToBase64url(compressed);
}

export async function decompressFromShareString(text: string): Promise<Kindergarten[]> {
  if (!text.startsWith(SHARE_PREFIX)) {
    throw new ImportFormatError(`共有文字列は "${SHARE_PREFIX}" で始まる必要があります`);
  }
  let bytes: Uint8Array<ArrayBuffer>;
  try {
    bytes = base64urlToBytes(text.slice(SHARE_PREFIX.length));
  } catch {
    throw new ImportFormatError('base64url のデコードに失敗しました');
  }
  let decompressed: Uint8Array<ArrayBuffer>;
  try {
    decompressed = await inflateRaw(bytes);
  } catch {
    throw new ImportFormatError('展開（inflate）に失敗しました（文字列が破損している可能性があります）');
  }
  return parseImport(new TextDecoder().decode(decompressed));
}
