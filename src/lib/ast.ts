import ts from 'typescript';
import { SwitchDirective } from '../type';
import { join } from 'path';
import { isSubDirectory } from './path';

const DIREVTIVE_HEADER = 'switch:';

export function getDirective(sourceFile: ts.SourceFile, node: ts.Node): SwitchDirective | undefined {
  // SourceFile には `getFullText` が無くて実行時エラーになるので, 明示的に無視する
  if (ts.isSourceFile(node)) return undefined;

  // NOTE: puppeteerを用いたプロジェクトでは何故か kind を持たない RedirectInfo オブジェクトが現れ，実行時エラーを発生させてしまうため，
  // ここで強引に検知して弾いてる．
  // ref: https://github.com/microsoft/TypeScript/blob/08e6bc20bb15e5e42d7468fd109bf9542b98cc73/src/compiler/types.ts#L2871
  if ((node as any).redirectInfo) return undefined;

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
// それでも見つからない場合はデフォルトディレクティブを返す.
export function findSwitchDirectiveRec(sourceFile: ts.SourceFile, node: ts.Node | undefined): SwitchDirective {
  if (!node) return {};

  const hit = getDirective(sourceFile, node);
  if (!hit) return findSwitchDirectiveRec(sourceFile, node.parent);

  return hit;
}

// あるファイルが typePackage 配下にあるかどうかを返す.
export function includeFileInTypePackage(typeRoots: string[], typePackageName: string, fileName: string): boolean {
  for (const typeRoot of typeRoots) {
    const typePackageDirname = join(typeRoot, typePackageName);
    if (isSubDirectory(typePackageDirname, fileName)) return true;
  }
  return false;
}
