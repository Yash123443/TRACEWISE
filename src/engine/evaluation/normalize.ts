const fillers = /\b(?:um|uh|like|you know|basically|so|well)\b/gi
export const normalizeForMatch = (text: string) => text.toLowerCase().replace(fillers, ' ').replace(/\s+/g, ' ').trim()
export const firstOriginalMatch = (text: string, pattern: RegExp): string | null => {
  const flags = pattern.flags.replace('g', '')
  return new RegExp(pattern.source, flags).exec(text)?.[0] ?? null
}
