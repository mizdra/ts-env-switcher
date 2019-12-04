import ts from 'typescript';
import { Project } from './type';

const DIREVTIVE_HEADER = 'switch:';

export type SwitchDirective = {
  lib?: string[];
};

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
      .slice(
        2,
        commentRangeInNode.kind === ts.SyntaxKind.MultiLineCommentTrivia
          ? -2
          : undefined,
      );
    if (!comment.trimStart().startsWith(DIREVTIVE_HEADER)) continue;
    const jsonStartPosInComment =
      comment.indexOf(DIREVTIVE_HEADER) + DIREVTIVE_HEADER.length;

    // ディレクティブが1つでも見つかったら即 return する
    return JSON.parse(comment.slice(jsonStartPosInComment));
  }
  return undefined;
}

function collectEnvRec(sourceFile: ts.SourceFile, node: ts.Node): string[] {
  const envList: string[] = [];

  if (
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isArrowFunction(node)
  ) {
    const switchDirective = findSwitchDirective(sourceFile, node);

    if (switchDirective && switchDirective.lib) {
      envList.push(switchDirective.lib[0]); // TODO: 複数のlibに対応する
    }
  }

  node.forEachChild((child) => {
    envList.push(...collectEnvRec(sourceFile, child));
  });

  return envList;
}

export function collectEnv(project: Project): string[] {
  const envList: string[] = [];
  project.sourceFiles.forEach((sourceFile) => {
    envList.push(...collectEnvRec(sourceFile, sourceFile));
  });
  return envList;
}
