import { read } from './read';
import { transform } from './transform';
import { write } from './write';
import { resolve } from 'path';
import { collectEnv } from './collect';

type Option = {
  srcBasePath: string;
  distBasePath: string;
};

export function checkEnv(option: Option) {
  const configFileName = resolve(option.srcBasePath, 'tsconfig.json');

  // read phase
  const srcProject = read(option.srcBasePath, configFileName);
  console.log(srcProject.sourceFiles.map((sourceFile) => sourceFile.fileName));

  // collect phase
  const envList = collectEnv(srcProject);
  console.log(envList);

  for (const env of envList) {
    const distPath = resolve(option.distBasePath, env);

    // transform phase
    const distProject = transform(srcProject, {
      env: env,
      distBasePath: distPath,
    });

    // write phase
    write(distProject);
  }
}
