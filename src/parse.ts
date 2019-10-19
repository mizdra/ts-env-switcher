import ts from 'typescript';

export function parse(compilerOptions: ts.ParsedCommandLine) {
  const program = ts.createProgram(
    compilerOptions.fileNames,
    compilerOptions.options,
  );

  const sourceFiles = program.getSourceFiles();

  return { program, sourceFiles };
}
