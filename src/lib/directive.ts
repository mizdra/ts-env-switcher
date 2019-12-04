import { SwitchDirective } from "../type";


export function createDirectiveIdentifier(directive: SwitchDirective): string {
  return 'lib-' + (directive.lib ?? []).sort().join('+')
}
