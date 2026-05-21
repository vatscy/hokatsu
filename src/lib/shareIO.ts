import type { Kindergarten } from '../types/kindergarten';
import {
  ImportFormatError,
  compactKindergarten,
  expandKindergarten,
} from './shareCodec';

export { ImportFormatError };

const SHARE_PREFIX = 'h1:';

// 共有文字列の内部構造。短縮表現の Kindergarten 配列のみ。
// プレフィックス `h1:` がフォーマット識別子を兼ねるため、JSON 側にメタ情報は持たない。
interface ExportPayload {
  k: ReturnType<typeof compactKindergarten>[];
}

function buildExportPayload(records: Kindergarten[]): ExportPayload {
  return { k: records.map(compactKindergarten) };
}

function parseEnvelope(text: string): Kindergarten[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new ImportFormatError('JSON として解釈できません');
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new ImportFormatError('JSON のトップレベルがオブジェクトではありません');
  }
  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.k)) {
    throw new ImportFormatError('k 配列がありません');
  }
  return obj.k.map((item) => expandKindergarten(item));
}

// ---- 共有文字列（deflate-raw 圧縮 + base64url）----

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
  return parseEnvelope(new TextDecoder().decode(decompressed));
}

// ---- ファイル入出力（共有文字列をそのまま .txt として扱う）----

export function downloadShareFile(text: string, fileName: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function defaultShareFileName(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `hokatsu-${y}${m}${d}.txt`;
}

// アップロードされた .txt ファイルから共有文字列を抽出する。
// 余分な前後空白や改行は許容する（メーラ等で折り返されたケースを救う）。
export function extractShareStringFromFileText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed.startsWith(SHARE_PREFIX)) {
    throw new ImportFormatError(`共有文字列は "${SHARE_PREFIX}" で始まる必要があります`);
  }
  return trimmed.replace(/\s+/g, '');
}
