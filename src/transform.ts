import { Project, SwitchDirective } from './type';
import { join, relative } from 'path';
import { isSubDirectory } from './lib/path';

function transformPath(
  srcBasePath: string,
  distBasePath: string,
  srcPath: string,
) {
  if (isSubDirectory(srcBasePath, srcPath)) {
    console.log(relative(srcBasePath, srcPath));
    return relative(srcBasePath, srcPath);
  }
  console.log(srcPath)
  // 外部モジュールの場合は変換せずに返す
  return srcPath;
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
      lib: (transformOption.directive.lib ?? []).map(libName => `lib.${libName}.d.ts`),
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
  const distSourceFiles = srcSourceFiles.map((sourceFile) => ({
    ...sourceFile,
    fileName: transformPath(
      srcBasePath,
      transformOption.distBasePath,
      sourceFile.fileName,
    ),
  }));

  return {
    basePath: transformOption.distBasePath,
    config: distConfig,
    packages: distPackages,
    sourceFiles: distSourceFiles,
  };
}
