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
    sourceFiles: srcSourceFiles,
  }: Project,
  distBasePath: string,
): Project {
  const distConfig = {
    fileName: transformPath(srcBasePath, distBasePath, srcConfig.fileName),
    parsedCommandLine: srcConfig.parsedCommandLine,
  };
  const distSourceFiles = srcSourceFiles.map((sourceFile) => ({
    ...sourceFile,
    fileName: transformPath(srcBasePath, distBasePath, sourceFile.fileName),
  }));

  return {
    basePath: distBasePath,
    config: distConfig,
    sourceFiles: distSourceFiles,
  };
}
