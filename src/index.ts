import { read } from './read';
import { transform } from './transform';
import { write } from './write';
import { join } from 'path';
import { collectDirectives } from './collect';
import { debug, format } from './lib/logger';
import { createDirectiveIdentifier } from './lib/directive';
import { check } from './check';

type Option = {
  srcBasePath: string;
  distBasePath: string;
};

export function checkEnv(option: Option) {
  const configFileName = join(option.srcBasePath, 'tsconfig.json');

  // read phase
  const srcProject = read(option.srcBasePath, configFileName);
  debug(format(srcProject.sourceFiles.map((sourceFile) => sourceFile.fileName)));

  // collect phase
  const directives = collectDirectives(srcProject);

  for (const directive of directives) {
    debug(format(directive));
    const distBasePath = join(option.distBasePath, createDirectiveIdentifier(directive));

    // transform phase
    const distProject = transform(srcProject, directive);

    // write phase
    write(distProject, distBasePath);

    check(distProject, directive);
  }
}
