import { Project, SwitchDirective } from './type';
import { join, relative, basename, dirname } from 'path';
import { isSubDirectory } from './lib/path';
import ts from 'typescript';
import { without, uniq } from 'lodash';

const DEFAULT_LIB_MAP = (ts as any).libMap as Map<string, string>;
const DEFAULT_LIB_BASENAMES = [...DEFAULT_LIB_MAP.values()];
const DEFAULT_LIB_DIRNAME = 'node_modules/typescript/lib';

function isDefaultLib(fileName: string): boolean {
  return DEFAULT_LIB_BASENAMES.includes(basename(fileName)) && dirname(fileName) === DEFAULT_LIB_DIRNAME;
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

export function transform(
  { basePath: srcBasePath, config: srcConfig, packages: srcPackages, sourceFiles: srcSourceFiles }: Project,
  directive: SwitchDirective,
): Project {
  const distConfig: Project['config'] = {
    ...srcConfig,
    compilerOptions: updateCompilerOptions(srcConfig.compilerOptions, directive),
  };
  const distPackages = srcPackages;
  const distSourceFiles = srcSourceFiles
    .map((sourceFile) => ts.getMutableClone(sourceFile))
    .filter(filterDefaultLibraries(directive));

  return {
    basePath: srcBasePath,
    config: distConfig,
    packages: distPackages,
    sourceFiles: distSourceFiles,
  };
}
