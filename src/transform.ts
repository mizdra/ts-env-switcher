import { Project, SwitchDirective } from './type';
import { join, relative } from 'path';
import { isSubDirectory } from './lib/path';
import ts from 'typescript';

function transformPath(srcBasePath: string, distBasePath: string, srcFileName: string) {
  if (isSubDirectory(srcBasePath, srcFileName)) {
    return join(distBasePath, relative(srcBasePath, srcFileName));
  }
  // 外部モジュールの場合は変換せずに返す
  return srcFileName;
}

function createEmptyBody() {
  return ts.createBlock(
    [
      ts.createReturn(
        ts.createAsExpression(ts.createNumericLiteral('0'), ts.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword)),
      ),
    ],
    true,
  );
}

function pathTransformerFactory(srcBasePath: string, distBasePath: string): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => (sourceFile: ts.SourceFile) => {
    return {
      ...sourceFile,
      fileName: transformPath(srcBasePath, distBasePath, sourceFile.fileName),
    };
  };
}

function deleteBodyTransformerFactory(directive: SwitchDirective): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => (sourceFile: ts.SourceFile) => {
    function visit(node: ts.Node): ts.Node {
      // NOTE: `node.body` は `undefined` の可能性があるので undefined チェックする
      if (ts.isFunctionDeclaration(node) && node.body) {
        node = ts.updateFunctionDeclaration(
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

      if (ts.isFunctionExpression(node) && node.body) {
        node = ts.updateFunctionExpression(
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

      if (ts.isArrowFunction(node) && node.body) {
        node = ts.updateArrowFunction(
          node,
          node.modifiers,
          node.typeParameters,
          node.parameters,
          node.type,
          node.equalsGreaterThanToken,
          createEmptyBody(),
        );
      }

      return ts.visitEachChild(node, visit, context);
    }
    return ts.visitNode(sourceFile, visit);
  };
}

export type TransformOption = {
  directive: SwitchDirective;
  distBasePath: string;
};

export function transform(
  { basePath: srcBasePath, config: srcConfig, packages: srcPackages, sourceFiles: srcSourceFiles }: Project,
  transformOption: TransformOption,
): Project {
  const distConfig: Project['config'] = {
    fileName: transformPath(srcBasePath, transformOption.distBasePath, srcConfig.fileName),
    compilerOptions: {
      ...srcConfig.compilerOptions,
      // lib をディレクティブで指定されたもので上書きする
      lib: (transformOption.directive.lib ?? []).map((libName) => `lib.${libName}.d.ts`),
    },
  };
  const distPackages = srcPackages.map((sourceFile) => ({
    ...sourceFile,
    fileName: transformPath(srcBasePath, transformOption.distBasePath, sourceFile.fileName),
  }));
  const transformationResult = ts.transform(
    srcSourceFiles.map((sourceFile) => ts.getMutableClone(sourceFile)),
    [
      pathTransformerFactory(srcBasePath, transformOption.distBasePath),
      deleteBodyTransformerFactory(transformOption.directive),
    ],
  );
  const distSourceFiles = transformationResult.transformed;

  return {
    basePath: transformOption.distBasePath,
    config: distConfig,
    packages: distPackages,
    sourceFiles: distSourceFiles,
  };
}
