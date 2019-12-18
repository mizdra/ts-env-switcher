import { Project, SwitchDirective } from './type';
import ts from 'typescript';
import { format, debug } from './lib/logger';
import { equalDirective } from './lib/directive';
import { findSwitchDirectiveRec } from './lib/ast';
import { relative, join } from 'path';

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
    if (!node) return false; // TS2688など, 発生源が不明のエラーはノイズになるので除外する
    if (!diagnostics.file) throw new Error('diagnostics に file フィールドがありません');
    const hitDirective = findSwitchDirectiveRec(diagnostics.file, node);
    // チェック対象のディレクティブの付いた場所で発生したエラーは残す
    return equalDirective(hitDirective, directive);
  };
}

export function check(project: Project, directive: SwitchDirective): ts.Diagnostic[] {
  // debug(format(project.sourceFiles.map((sourceFile) => sourceFile.fileName)));

  const compilerHost: ts.CompilerHost = {
    ...ts.createCompilerHost(project.config.compilerOptions),
    getSourceFile: (fileName) => {
      const normalizedFileName = relative(ts.sys.getCurrentDirectory(), fileName);
      const hitSourceFile = project.sourceFiles.find((sourceFile) => sourceFile.fileName === normalizedFileName);
      if (hitSourceFile) return hitSourceFile;
      return undefined;
    },
    fileExists: (fileName) => {
      const normalizedFileName = relative(ts.sys.getCurrentDirectory(), fileName);
      return (
        project.config.fileName === normalizedFileName ||
        project.packages.some((pkg) => pkg.fileName === normalizedFileName) ||
        project.sourceFiles.some((sourceFile) => sourceFile.fileName === normalizedFileName)
      );
    },
    getDefaultLibLocation: () => join(project.basePath, 'node_modules/typescript/lib'),
  };

  const program = ts.createProgram(
    project.sourceFiles.map((sourceFile) => sourceFile.fileName),
    {
      ...project.config.compilerOptions,
      noEmit: true,
    },
    compilerHost,
  );
  const emitResult = program.emit();

  const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
  const filteredDiagnostics = allDiagnostics.filter(createDirectiveFilter(directive));

  return filteredDiagnostics;
}
