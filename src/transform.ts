import ts from 'typescript';
import { Project } from './type';
import { join, relative } from 'path';

function transformPath(
  srcBasePath: string,
  distBasePath: string,
  srcPath: string,
) {
  return join(distBasePath, relative(srcBasePath, srcPath));
}

export function transform(
  {
    basePath: srcBasePath,
    configFile: srcConfigFile,
    sourceFiles: srcSourceFiles,
  }: Project,
  distBasePath: string,
): Project {
  const distConfigFile = {
    name: transformPath(srcBasePath, distBasePath, srcConfigFile.name),
    parsedCommandLine: srcConfigFile.parsedCommandLine,
  };
  const distSourceFiles = srcSourceFiles.map((sourceFile) => ({
    ...sourceFile,
    fileName: transformPath(srcBasePath, distBasePath, sourceFile.fileName),
  }));

  return {
    basePath: distBasePath,
    configFile: distConfigFile,
    sourceFiles: distSourceFiles,
  };
}
