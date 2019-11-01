import { read } from './read';
import { transform } from './transform';
import { write } from './write';
import { resolve } from 'path';
import { collectEnv } from './collect';

type Option = {
  srcBasePath: string;
  distPath?: string;
};
function checkEnv(option: Option) {
  const configFileName = resolve(option.srcBasePath, 'tsconfig.json');

  // read phase
  const srcProject = read(option.srcBasePath, configFileName);
  console.log(srcProject.sourceFiles.map((sourceFile) => sourceFile.fileName));

  // collect phase
  const envList = collectEnv(srcProject);
  console.log(envList);

  // transform phase
  const distProject = transform(
    srcProject,
    option.distPath || option.srcBasePath,
  );

  // write phase
  if (option.distPath) write(distProject);
}

checkEnv({
  srcBasePath: resolve('fixtures/src/7-env'),
  distPath: resolve('fixtures/dist/7-env'),
});
