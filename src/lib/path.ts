import { relative, basename, join } from 'path';

export function isSubDirectory(parent: string, child: string) {
  return !relative(parent, child).startsWith('..');
}

export function getConfigFileName(project: string): string {
  if (basename(project) === 'tsconfig.json') return project;
  return join(project, 'tsconfig.json');
}
