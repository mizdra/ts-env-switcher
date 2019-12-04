import ts from 'typescript';
import { Project } from './type';
import { isSubDirectory } from './lib/path';
import { warning } from './lib/logger';
import { join } from 'path';

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
  ts.sys.writeFile(
    join(basePath, config.fileName),
    createTsConfig(config, sourceFiles),
  );

  // packages
  packages.forEach((pkg) => {
    if (isSubDirectory(basePath, pkg.fileName))
      ts.sys.writeFile(join(basePath, pkg.fileName), pkg.raw);
    else warning(`${pkg.fileName} is not under ${basePath}.`);
  });

  // sourceFiles
  sourceFiles.forEach((sourceFile) => {
    const code = printer.printFile(sourceFile);
    if (isSubDirectory(basePath, sourceFile.fileName))
      ts.sys.writeFile(join(basePath, sourceFile.fileName), code);
    else warning(`${sourceFile.fileName} is not under ${basePath}.`);
  });
}
