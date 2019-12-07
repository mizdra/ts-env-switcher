import ts from 'typescript';
import { SwitchDirective } from '../type';

const DIREVTIVE_HEADER = 'switch:';

export function getDirective(sourceFile: ts.SourceFile, node: ts.Node): SwitchDirective | undefined {
  // SourceFile には `getFullText` が無くて実行時エラーになるので, 明示的に無視する
  if (ts.isSourceFile(node)) return undefined;

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

    const jsonStartPosInComment = comment.indexOf(DIREVTIVE_HEADER) + DIREVTIVE_HEADER.length;

    // ディレクティブが1つでも見つかったら即 return する
    return JSON.parse(comment.slice(jsonStartPosInComment));
  }
  return undefined;
}

// node に紐づくディレクティブを返す.
// ディレクティブが無い場合は親ノードを辿って再帰的に検索する.
export function findSwitchDirectiveRec(
  sourceFile: ts.SourceFile,
  node: ts.Node | undefined,
): SwitchDirective | undefined {
  if (!node) return undefined;
  const hit = getDirective(sourceFile, node);
  if (!hit) return findSwitchDirectiveRec(sourceFile, node.parent);
  return hit;
}
