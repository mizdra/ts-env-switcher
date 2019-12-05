import { Project, SwitchDirective } from './type';
import { join, relative } from 'path';
import { isSubDirectory } from './lib/path';
import ts from 'typescript';
import { isFunction, removeFunctionBody, findSwitchDirective } from './lib/ast';
import { equalDirective } from './lib/directive';

function transformPath(srcBasePath: string, distBasePath: string, srcFileName: string) {
  if (isSubDirectory(srcBasePath, srcFileName)) {
    return join(distBasePath, relative(srcBasePath, srcFileName));
  }
  // 外部モジュールの場合は変換せずに返す
  return srcFileName;
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
      if (isFunction(node) && node.body) {
        const actualDirective = findSwitchDirective(sourceFile, node);

        // 異なるディレクティブの関数の body を削除
        // NOTE: 以下のようなネストしたアロー関数を残したいので, ディレクティブが付いていない関数の body は削除しない
        // ```
        // function scrape() {
        //   page.evaluate(/* switch: { "lib": ["es5", "dom"] } */ () => { ... })
        // }
        // ```
        if (actualDirective && !equalDirective(actualDirective, directive)) {
          node = removeFunctionBody(node);
        }
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
