import { read } from './read';
import { transform } from './transform';
import { write } from './write';
import { join, basename } from 'path';
import { collectDirectives } from './collect';
import { debug, format, info } from './lib/logger';
import { createDirectiveIdentifier } from './lib/directive';
import { check } from './check';
import { getConfigFileName } from './lib/path';

type Option = {
  project?: string;
  outDir?: string;
};

export function checkEnv(option: Option) {
  const projectOption = option.project ?? '.';
  const configFileName = getConfigFileName(projectOption);

  // read phase
  const srcProject = read(projectOption, configFileName);
  debug(format(srcProject.sourceFiles.map((sourceFile) => sourceFile.fileName)));

  // collect phase
  const directives = collectDirectives(srcProject);

  for (const directive of directives) {
    console.log('-'.repeat(process.stdout.columns));
    info('Checking for ' + format(directive));

    // transform phase
    const distProject = transform(srcProject, directive);

    // write phase (--outDir が指定された時のみ)
    if (option.outDir !== undefined) {
      const distBasePath = join(option.outDir, createDirectiveIdentifier(directive));
      write(distProject, distBasePath);
    }

    check(distProject, directive);
  }
}
