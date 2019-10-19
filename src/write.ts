import ts from 'typescript';
import { join, relative } from 'path';

export function write(
  sourceFiles: readonly ts.SourceFile[],
  compilerOptions: ts.ParsedCommandLine,
  srcConfigFileName: string,
  srcBasePath: string,
  distBasePath: string,
) {
  const printer = ts.createPrinter();

  sourceFiles.forEach((sourceFile) => {
    const code = printer.printFile(sourceFile);

    ts.sys.writeFile(
      join(distBasePath, relative(srcBasePath, sourceFile.fileName)),
      code,
    );
    ts.sys.writeFile(
      join(distBasePath, relative(srcBasePath, srcConfigFileName)),
      JSON.stringify(compilerOptions.raw, null, 2),
    );
  });
}
