export function containsPattern(search: string | undefined): string | null {
  return search ? `%${escapeLikeWildcards(search)}%` : null;
}

export function nameMatchesFilter(patternParam: string): string {
  return `(${patternParam}::text is null or unaccent(name) ilike unaccent(${patternParam}::text))`;
}

function escapeLikeWildcards(term: string): string {
  return term.replace(/[\\%_]/g, "\\$&");
}
