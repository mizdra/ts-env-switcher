import { relative } from 'path';

export function isSubDirectory(parent: string, child: string) {
  return !relative(parent, child).startsWith('..');
}
