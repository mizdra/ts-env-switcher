import ts from 'typescript';
import { Project } from './type';

function collectEnvRec(node: ts.Node): string[] {
  const envList: string[] = [];

  if (
    ts.isDecorator(node) &&
    ts.isCallExpression(node.expression) &&
    (node.expression.expression as ts.Identifier).escapedText === 'Env' &&
    node.expression.arguments.length === 1 &&
    ts.isStringLiteral(node.expression.arguments[0])
  ) {
    const stringLiteral = node.expression.arguments[0] as ts.StringLiteral;
    envList.push(stringLiteral.text);
  }

  node.forEachChild((child) => {
    envList.push(...collectEnvRec(child));
  });

  return envList;
}

export function collectEnv(project: Project): string[] {
  const envList: string[] = [];
  project.sourceFiles.forEach((sourceFile) => {
    envList.push(...collectEnvRec(sourceFile));
  });
  return envList;
}
