import { Project, SwitchDirective } from '../type';
import { join, relative, basename, dirname } from 'path';
import { isSubDirectory } from '../lib/path';
import ts from 'typescript';
import { without, uniq } from 'lodash';
import { includeFileInTypePackage } from '../lib/ast';

const DEFAULT_LIB_MAP = (ts as any).libMap as Map<string, string>;
const DEFAULT_LIB_BASENAMES = [...DEFAULT_LIB_MAP.values()];
const DEFAULT_LIB_DIRNAME = 'node_modules/typescript/lib';

function isDefaultLib(fileName: string): boolean {
  // TODO: 真面目にやるなら `compilerHost` を project に持たせた上で,
  // `compilerHost.getDefaultLibLocation` から得られるパスを利用する.
  return DEFAULT_LIB_BASENAMES.includes(basename(fileName)) && dirname(fileName).endsWith(DEFAULT_LIB_DIRNAME);
}

function getDefaultLibName(defaultLibFileName: string): string {
  const wantedBasename = basename(defaultLibFileName);
  for (const [defaultLibName, defaultLibBasename] of DEFAULT_LIB_MAP.entries()) {
    if (wantedBasename === defaultLibBasename) return defaultLibName;
  }
  throw new Error(`デフォルトライブラリ ${defaultLibFileName} のファイル名が不正です`);
}

// `-lib` で指定されたデフォルトライブラリを除外する
function filterDefaultLibraries(directive: SwitchDirective) {
  return (sourceFile: ts.SourceFile): boolean => {
    if (!isDefaultLib(sourceFile.fileName)) return true;

    // `-lib` がそもそも設定されていない場合は除外するべきファイルも無い
    if (directive['-lib'] === undefined) return true;

    return !directive['-lib'].includes(getDefaultLibName(sourceFile.fileName));
  };
}

// `-types` で指定されたプロジェクトの型定義を除外する
function filterByTypes(srcProject: Project, directive: SwitchDirective) {
  const typeRoots = ts.getEffectiveTypeRoots(srcProject.config.compilerOptions, {
    getCurrentDirectory: () => srcProject.basePath,
  });
  // `-types` がそもそも設定されていない場合は何も除外しない
  if (directive['-types'] === undefined) return () => true;
  // typeRootsが無い場合は型パッケージが一切存在しないので, 何も除外しない
  if (typeRoots === undefined) return () => true;

  return (sourceFile: ts.SourceFile): boolean => {
    for (const typePackageName of directive['-types']!) {
      if (includeFileInTypePackage(typeRoots, typePackageName, sourceFile.fileName)) {
        return false; // `-types` にあるパッケージの型定義であれば除外
      }
    }
    return true;
  };
}

function updateCompilerOptions(oldCompilerOptions: ts.CompilerOptions, directive: SwitchDirective): ts.CompilerOptions {
  let newLib = oldCompilerOptions.lib ?? [];
  if (directive['-lib']) newLib = without(newLib, ...directive['-lib'].map((libName) => `lib.${libName}.d.ts`));
  return {
    ...oldCompilerOptions,
    lib: newLib,
    // `types: []` などに設定されていると `+types` で追加したライブラリがコンパイルに含まれなくなってしまうので,
    // 全てのTypePackageが読み込まれるよう設定を上書きする
    types: undefined,
  };
}

export function transform(srcProject: Project, directive: SwitchDirective): Project {
  const distConfig: Project['config'] = {
    ...srcProject.config,
    compilerOptions: updateCompilerOptions(srcProject.config.compilerOptions, directive),
  };
  const distSourceFiles = srcProject.sourceFiles
    .map((sourceFile) => ts.getMutableClone(sourceFile))
    .filter(filterDefaultLibraries(directive))
    .filter(filterByTypes(srcProject, directive));

  return {
    ...srcProject,
    config: distConfig,
    sourceFiles: distSourceFiles,
  };
}
