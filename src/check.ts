import { Project } from './type';
import ts from 'typescript';
import { format, debug } from './lib/logger';

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: (path) => path,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine,
};

export function check(project: Project) {
  // const sourceFileNames = project.sourceFiles.map((sourceFile) => sourceFile.fileName);
  // console.log(sourceFileNames);
  // debug(format(sourceFileNames));

  // const compilerHost: ts.CompilerHost = {
  //   ...ts.createCompilerHost(project.config.compilerOptions),
  //   fileExists: (fileName) => {
  //     if (project.sourceFiles.find((sourceFile) => sourceFile.fileName === fileName)) return true;
  //     if (project.packages.find((pkg) => pkg.fileName === fileName)) return true;
  //     return false;
  //   },
  //   getSourceFile: (fileName) => project.sourceFiles.find((sourceFile) => sourceFile.fileName === fileName),
  //   readFile: (fileName) => {
  //     const hitSourceFile = project.sourceFiles.find((sourceFile) => sourceFile.fileName === fileName);
  //     if (hitSourceFile) return hitSourceFile.text;
  //     const hitPackage = project.packages.find((pkg) => pkg.fileName === fileName);
  //     if (hitPackage) return hitPackage.raw;
  //     return undefined;
  //   },
  // };
  const program = ts.createProgram(
    project.sourceFiles.map((sourceFile) => sourceFile.fileName),
    project.config.compilerOptions,
    // compilerHost,
  );
  const emitResult = program.emit();

  const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
  console.log(ts.formatDiagnosticsWithColorAndContext(allDiagnostics, formatHost));
}
