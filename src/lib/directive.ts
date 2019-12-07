import { SwitchDirective } from '../type';

export function createDirectiveIdentifier(directive: SwitchDirective): string {
  return Object.entries<string[]>(sortJSON(directive))
    .map(([key, value]) => {
      return key + '_' + value.join('+').replace(/\//g, '-');
    })
    .join('__');
}

function sortJSON(json: any): any {
  if (typeof json !== 'object' || !json) return json;
  if (Array.isArray(json)) return json.map(sortJSON);
  return Object.keys(json)
    .sort()
    .reduce((o, k) => ({ ...o, [k]: sortJSON(json[k]) }), {});
}

export function equalDirective(a: SwitchDirective, b: SwitchDirective): boolean {
  return createDirectiveIdentifier(a) === createDirectiveIdentifier(b);
}
