import { SwitchDirective } from '../type';

export function createDirectiveIdentifier(directive: SwitchDirective): string {
  const normalizedDirective = normalizeDirective(directive);
  return JSON.stringify(normalizedDirective);
}

export function normalizeDirective(
  directive: SwitchDirective,
): SwitchDirective {
  const normalizedDirective: SwitchDirective = {};
  if (directive.lib) normalizedDirective.lib = directive.lib.slice().sort();
  return normalizedDirective;
}

export function equalDirective(
  a: SwitchDirective,
  b: SwitchDirective,
): boolean {
  return createDirectiveIdentifier(a) === createDirectiveIdentifier(b);
}
