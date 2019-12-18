import { read } from './read';
import { transform } from './transform';
import { write } from './write';
import { join, basename } from 'path';
import { collectDirectives } from './collect';
import { debug, format, info, setDebugMode } from './lib/logger';
import { createDirectiveIdentifier } from './lib/directive';
import { check } from './check';
import { getConfigFileName } from './lib/path';
import ts = require('typescript');

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: (path) => path,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine,
};

type Option = {
  project?: string;
  outDir?: string;
  debug?: boolean;
};

export function checkEnv(option: Option) {
  const projectOption = option.project ?? '.';
  const configFileName = getConfigFileName(projectOption);
  setDebugMode(option.debug ?? false);

  // read phase
  const srcProject = read(projectOption, configFileName);
  debug(format(srcProject.sourceFiles.map((sourceFile) => sourceFile.fileName)));

  // collect phase
  const directives = collectDirectives(srcProject);

  const diagnostics: ts.Diagnostic[] = [];
  for (const directive of directives) {
    debug('Checking for ' + format(directive));

    // transform phase
    const distProject = transform(srcProject, directive);

    // write phase (--outDir が指定された時のみ)
    if (option.outDir !== undefined) {
      const distBasePath = join(option.outDir, createDirectiveIdentifier(directive));
      write(distProject, distBasePath);
    }

    diagnostics.push(...check(distProject, directive));
  }

  // エラーが一件でもある場合はエラーを出力して異常終了する
  if (diagnostics.length > 0) {
    console.log(ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost));
    process.exit(1);
  }
}
