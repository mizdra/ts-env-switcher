import ts from 'typescript';
import { SwitchDirective } from '../type';
import { debug, format } from './logger';

type Func = ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction;

export function createEmptyBody() {
  return ts.createBlock(
    [
      ts.createReturn(
        ts.createAsExpression(ts.createNumericLiteral('0'), ts.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword)),
      ),
    ],
    true,
  );
}

export function isFunction(node: ts.Node): node is Func {
  return ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node);
}

export function removeFunctionBody(node: Func) {
  if (ts.isFunctionDeclaration(node)) {
    return ts.updateFunctionDeclaration(
      node,
      node.decorators,
      node.modifiers,
      node.asteriskToken,
      node.name,
      node.typeParameters,
      node.parameters,
      node.type,
      createEmptyBody(),
    );
  }
  if (ts.isFunctionExpression(node)) {
    return ts.updateFunctionExpression(
      node,
      node.modifiers,
      node.asteriskToken,
      node.name,
      node.typeParameters,
      node.parameters,
      node.type,
      createEmptyBody(),
    );
  }
  if (ts.isArrowFunction(node)) {
    return ts.updateArrowFunction(
      node,
      node.modifiers,
      node.typeParameters,
      node.parameters,
      node.type,
      node.equalsGreaterThanToken,
      createEmptyBody(),
    );
  }
  throw new Error('unreachable');
}

const DIREVTIVE_HEADER = 'switch:';

export function findSwitchDirective(sourceFile: ts.SourceFile, node: Func): SwitchDirective | undefined {
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
