import ts from 'typescript';
import { Project, SwitchDirective } from './type';
import { debug, format } from './lib/logger';
import { createDirectiveIdentifier, equalDirective } from './lib/directive';

const DIREVTIVE_HEADER = 'switch:';

function findSwitchDirective(
  sourceFile: ts.SourceFile,
  node: ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction,
): SwitchDirective | undefined {
  const nodeFullText = node.getFullText(sourceFile);
  const commentRangesInNode = ts.getLeadingCommentRanges(nodeFullText, 0);
  if (!commentRangesInNode) return undefined;

  for (const commentRangeInNode of commentRangesInNode) {
    const comment = nodeFullText
      // ノードからコメントを抜き出す
      .slice(commentRangeInNode.pos, commentRangeInNode.end)
      // `//` or `/*` `*/` を取り除く
      .slice(2, commentRangeInNode.kind === ts.SyntaxKind.MultiLineCommentTrivia ? -2 : undefined);
    if (!comment.trimStart().startsWith(DIREVTIVE_HEADER)) continue;

    debug(format({ comment }));
    const jsonStartPosInComment = comment.indexOf(DIREVTIVE_HEADER) + DIREVTIVE_HEADER.length;

    // ディレクティブが1つでも見つかったら即 return する
    return JSON.parse(comment.slice(jsonStartPosInComment));
  }
  return undefined;
}

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
