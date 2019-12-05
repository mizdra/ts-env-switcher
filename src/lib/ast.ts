import ts from 'typescript';

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
