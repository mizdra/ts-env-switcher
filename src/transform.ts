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

export function transform(
  {
    basePath: srcBasePath,
    config: srcConfig,
    packages: srcPackages,
    sourceFiles: srcSourceFiles,
  }: Project,
  distBasePath: string,
): Project {
  const distConfig: Project['config'] = {
    fileName: transformPath(srcBasePath, distBasePath, srcConfig.fileName),
    compilerOptions: srcConfig.compilerOptions,
  };
  const distPackages = srcPackages.map((sourceFile) => ({
    ...sourceFile,
    fileName: transformPath(srcBasePath, distBasePath, sourceFile.fileName),
  }));
  const distSourceFiles = srcSourceFiles.map((sourceFile) => ({
    ...sourceFile,
    fileName: transformPath(srcBasePath, distBasePath, sourceFile.fileName),
  }));

  return {
    basePath: distBasePath,
    config: distConfig,
    packages: distPackages,
    sourceFiles: distSourceFiles,
  };
}
