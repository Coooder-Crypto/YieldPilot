export function stringifyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export async function copyJsonToClipboard(value: unknown): Promise<void> {
  const text = stringifyJson(value);
  await navigator.clipboard.writeText(text);
}

export function parseJson<T>(text: string): T {
  return JSON.parse(text) as T;
}
