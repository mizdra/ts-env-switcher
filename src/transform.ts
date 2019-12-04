import { Project, SwitchDirective } from './type';
import { join, relative } from 'path';
import { isSubDirectory } from './lib/path';
import ts from 'typescript';

function transformPath(
  srcBasePath: string,
  distBasePath: string,
  srcFileName: string,
) {
  if (isSubDirectory(srcBasePath, srcFileName)) {
    return join(distBasePath, relative(srcBasePath, srcFileName));
  }
  // 外部モジュールの場合は変換せずに返す
  return srcFileName;
}

function pathTransformerFactory(
  srcBasePath: string,
  distBasePath: string,
): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => (sourceFile: ts.SourceFile) => {
    return {
      ...sourceFile,
      fileName: transformPath(srcBasePath, distBasePath, sourceFile.fileName),
    };
  };
}

export type TransformOption = {
  directive: SwitchDirective;
  distBasePath: string;
};

export function transform(
  {
    basePath: srcBasePath,
    config: srcConfig,
    packages: srcPackages,
    sourceFiles: srcSourceFiles,
  }: Project,
  transformOption: TransformOption,
): Project {
  const distConfig: Project['config'] = {
    fileName: transformPath(
      srcBasePath,
      transformOption.distBasePath,
      srcConfig.fileName,
    ),
    compilerOptions: {
      ...srcConfig.compilerOptions,
      // lib をディレクティブで指定されたもので上書きする
      lib: (transformOption.directive.lib ?? []).map(
        (libName) => `lib.${libName}.d.ts`,
      ),
    },
  };
  const distPackages = srcPackages.map((sourceFile) => ({
    ...sourceFile,
    fileName: transformPath(
      srcBasePath,
      transformOption.distBasePath,
      sourceFile.fileName,
    ),
  }));
  const transformationResult = ts.transform(
    srcSourceFiles.map((sourceFile) => ts.getMutableClone(sourceFile)),
    [pathTransformerFactory(srcBasePath, transformOption.distBasePath)],
  );
  const distSourceFiles = transformationResult.transformed;

  return {
    basePath: transformOption.distBasePath,
    config: distConfig,
    packages: distPackages,
    sourceFiles: distSourceFiles,
  };
}
