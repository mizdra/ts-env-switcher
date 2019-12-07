import { Project, SwitchDirective } from './type';
import ts from 'typescript';
import { format, debug } from './lib/logger';
import { equalDirective } from './lib/directive';
import { findSwitchDirectiveRec } from './lib/ast';

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: (path) => path,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine,
};

// Diagnostics から Node を取得
function getNodeFromDiagnostics(diagnostics: ts.Diagnostic): ts.Node | undefined {
  if (diagnostics.start === undefined) return undefined; // 発生位置が無いエラーが存在するらしい
  if (!diagnostics.file) throw new Error('diagnostics に file フィールドがありません');

  // 浅いノードから検索すると常に最上位のノードがヒットしてしまうので,
  // 深さ優先探索で深いノードから検索する
  function visit(node: ts.Node): ts.Node | undefined {
    const hitNode = ts.forEachChild(node, visit);
    if (hitNode) return hitNode;
    if (node.pos <= diagnostics.start! && diagnostics.start! < node.end) return node;
    return undefined;
  }
  return ts.visitNode(diagnostics.file, visit);
}

// 指定されたディレクティブで発生したエラー以外を除外する
function createDirectiveFilter(directive: SwitchDirective) {
  return (diagnostics: ts.Diagnostic): boolean => {
    const node = getNodeFromDiagnostics(diagnostics);
    if (!node) return true; // 発生源が不明のエラーは一応残しておく
    if (!diagnostics.file) throw new Error('diagnostics に file フィールドがありません');
    const hitDirective = findSwitchDirectiveRec(diagnostics.file, node);
    if (!hitDirective) return false; // ディレクティブが無い場所で発生したエラーは無視
    // チェック対象のディレクティブの付いた場所で発生したエラーは残す
    return equalDirective(hitDirective, directive);
  };
}

export function check(project: Project, directive: SwitchDirective) {
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
  const filteredDiagnostics = allDiagnostics.filter(createDirectiveFilter(directive));

  console.log(ts.formatDiagnosticsWithColorAndContext(filteredDiagnostics, formatHost));
}
