import ts from 'typescript';
import { Project } from './type';
import { relative } from 'path';

function isSubDirectory(parent: string, child: string) {
  return !relative(parent, child).startsWith('..');
}

export function write({ basePath, configFile, sourceFiles }: Project) {
  const printer = ts.createPrinter();

  // configFile
  ts.sys.writeFile(
    configFile.name,
    JSON.stringify(configFile.parsedCommandLine.raw, null, 2),
  );

  // sourceFiles
  sourceFiles.forEach((sourceFile) => {
    const code = printer.printFile(sourceFile);
    if (isSubDirectory(basePath, sourceFile.fileName))
      ts.sys.writeFile(sourceFile.fileName, code);
    else
      console.warn(`warning: ${sourceFile.fileName} is not under ${basePath}.`);
  });
}
