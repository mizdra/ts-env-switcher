import ts from 'typescript';
import { Project } from './type';
import { resolve, relative } from 'path';

function transformPath(
  srcBasePath: string,
  distBasePath: string,
  srcPath: string,
) {
  return resolve(distBasePath, relative(srcBasePath, srcPath));
}

export type TransformOption = {
  env: string;
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
      // lib に Env アノテーションで指定された型定義を追加
      lib: [
        ...(srcConfig.compilerOptions.lib || []),
        `lib.${transformOption.env}.d.ts`,
      ],
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
