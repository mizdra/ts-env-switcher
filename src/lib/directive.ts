import { SwitchDirective } from '../type';

// ディレクティブと一対一で対応する識別子を生成する.
// 得られる識別子はファイル名として使えるよう, ファイル名に使用できない特殊文字を含まないようになっている.
export function createDirectiveIdentifier(directive: SwitchDirective): string {
  const str = Object.entries<string[]>(sortJSON(directive))
    .map(([key, value]) => {
      return key + '=' + value.join('!').replace(/\//g, '#');
    })
    .join('_');
  return '_' + str + '_'; // str が空文字の時に identifierが空文字にならないよう, `_` で囲う
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
