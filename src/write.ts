import ts from 'typescript';
import { Project } from './type';

export function write({ configFile, sourceFiles }: Project) {
  const printer = ts.createPrinter();

  // configFile
  ts.sys.writeFile(
    configFile.name,
    JSON.stringify(configFile.parsedCommandLine.raw, null, 2),
  );

  // sourceFiles
  sourceFiles.forEach((sourceFile) => {
    const code = printer.printFile(sourceFile);
    ts.sys.writeFile(sourceFile.fileName, code);
  });
}
