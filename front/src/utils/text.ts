export function normalizeForSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function matchesSearch(text: string, search: string): boolean {
  const term = normalizeForSearch(search);
  return term === "" || normalizeForSearch(text).includes(term);
}

export function compareByName(a: { name: string }, b: { name: string }): number {
  return a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" });
}

export function withTrimmedName<T extends { name: string }>(input: T): T {
  return { ...input, name: input.name.trim() };
}
