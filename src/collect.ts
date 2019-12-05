import ts from 'typescript';
import { Project, SwitchDirective } from './type';
import { equalDirective } from './lib/directive';
import { findSwitchDirective } from './lib/ast';

function collectDirectivesRec(sourceFile: ts.SourceFile, node: ts.Node): SwitchDirective[] {
  const directives: SwitchDirective[] = [];

  if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
    const switchDirective = findSwitchDirective(sourceFile, node);
    if (switchDirective) {
      directives.push(switchDirective);
    }
  }

  node.forEachChild((child) => {
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
  const directives: SwitchDirective[] = [];
  project.sourceFiles.forEach((sourceFile) => {
    directives.push(...collectDirectivesRec(sourceFile, sourceFile));
  });
  return filterDuplicate(directives);
}
