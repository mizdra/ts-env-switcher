import ts from 'typescript';
import { Project } from './type';
import { relative } from 'path';

function isSubDirectory(parent: string, child: string) {
  return !relative(parent, child).startsWith('..');
}

function createTsConfig(
  config: Project['config'],
  sourceFiles: Project['sourceFiles'],
): any {
  return (ts as any).generateTSConfig(
    config.compilerOptions,
    sourceFiles.map((sourceFile) => sourceFile.fileName),
    '\n',
  );
}

export function write({ basePath, config, packages, sourceFiles }: Project) {
  const printer = ts.createPrinter();

  // configFile
  ts.sys.writeFile(config.fileName, createTsConfig(config, sourceFiles));

  // packages
  packages.forEach((pkg) => {
    if (isSubDirectory(basePath, pkg.fileName))
      ts.sys.writeFile(pkg.fileName, pkg.raw);
    else console.warn(`warning: ${pkg.fileName} is not under ${basePath}.`);
  });

  // sourceFiles
  sourceFiles.forEach((sourceFile) => {
    const code = printer.printFile(sourceFile);
    if (isSubDirectory(basePath, sourceFile.fileName))
      ts.sys.writeFile(sourceFile.fileName, code);
    else
      console.warn(`warning: ${sourceFile.fileName} is not under ${basePath}.`);
  });
}
