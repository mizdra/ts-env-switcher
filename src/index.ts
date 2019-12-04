import { read } from './read';
import { transform } from './transform';
import { write } from './write';
import { resolve } from 'path';
import { collectDirectives, SwitchDirective } from './collect';
import { debug, format } from './lib/logger';

type Option = {
  srcBasePath: string;
  distBasePath: string;
};

function createDistProjectName(directive: SwitchDirective): string {
  return 'lib-' + (directive.lib ?? []).sort().join('+')
}

export function checkEnv(option: Option) {
  const configFileName = resolve(option.srcBasePath, 'tsconfig.json');

  // read phase
  const srcProject = read(option.srcBasePath, configFileName);
  debug(
    format(srcProject.sourceFiles.map((sourceFile) => sourceFile.fileName)),
  );

  // collect phase
  const directives = collectDirectives(srcProject);
  debug(format(directives));

  for (const directive of directives) {
    const distPath = resolve(option.distBasePath, createDistProjectName(directive));

    // transform phase
    const distProject = transform(srcProject, {
      directive,
      distBasePath: distPath,
    });

    // write phase
    write(distProject);
  }
}
