import ts from 'typescript';
import { Project, SwitchDirective } from './type';
import { equalDirective } from './lib/directive';
import { getDirective } from './lib/ast';

function collectDirectivesRec(sourceFile: ts.SourceFile, node: ts.Node): SwitchDirective[] {
  const directives: SwitchDirective[] = [];

  const switchDirective = getDirective(sourceFile, node);
  if (switchDirective) {
    directives.push(switchDirective);
  }

  ts.forEachChild(node, (child) => {
    directives.push(...collectDirectivesRec(sourceFile, child));
  });

  return directives;
}

function filterDuplicate(directives: SwitchDirective[]): SwitchDirective[] {
  const uniqueDirectives: SwitchDirective[] = [];
  for (const directive of directives) {
    const duplicate = uniqueDirectives.find((uniqueDirective) => equalDirective(uniqueDirective, directive));
    if (duplicate) continue; // 重複する場合は除外
    uniqueDirectives.push(directive);
  }
  return uniqueDirectives;
}

export function collectDirectives(project: Project): SwitchDirective[] {
  const directives: SwitchDirective[] = [{}]; // デフォルトディレクティブもセットしておく
  project.sourceFiles.forEach((sourceFile) => {
    directives.push(...collectDirectivesRec(sourceFile, sourceFile));
  });
  return filterDuplicate(directives);
}
