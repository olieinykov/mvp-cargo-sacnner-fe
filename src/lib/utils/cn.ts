export const cn = (...values: Array<string | undefined | null | false>): string =>
  values.filter(Boolean).join(' ');

