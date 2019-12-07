import { Project, SwitchDirective } from './type';
import { join, relative } from 'path';
import { isSubDirectory } from './lib/path';
import ts from 'typescript';
import { without, uniq } from 'lodash';

const DEFAULT_LIB_REG_EXP = /node_modules\/typescript\/lib\/lib\.(?<libName>\w+)\.d\.ts$/;

// `-lib` で指定されたデフォルトライブラリを除外する
function filterDefaultLibraries(directive: SwitchDirective) {
  return (sourceFile: ts.SourceFile): boolean => {
    // `-lib` がそもそも設定されていない場合は除外するべきファイルも無い
    if (directive['-lib'] === undefined) return true;

    const result = sourceFile.fileName.match(DEFAULT_LIB_REG_EXP);
    if (result === null) return true;
    if (result.groups === undefined)
      throw new Error(`デフォルトライブラリ ${sourceFile.fileName} のファイル名が不正です`);

    return !directive['-lib'].includes(result.groups.libName);
  };
}

function updateCompilerOptions(oldCompilerOptions: ts.CompilerOptions, directive: SwitchDirective): ts.CompilerOptions {
  let newLib = oldCompilerOptions.lib ?? [];
  if (directive['-lib']) newLib = without(newLib, ...directive['-lib'].map((libName) => `lib.${libName}.d.ts`));
  return {
    ...oldCompilerOptions,
    lib: newLib,
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
