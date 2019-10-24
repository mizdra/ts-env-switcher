import { read } from './read';
import { transform } from './transform';
import { write } from './write';
import { resolve } from 'path';

type Option = {
  srcBasePath: string;
  distPath?: string;
};
function checkEnv(option: Option) {
  const configFileName = resolve(option.srcBasePath, 'tsconfig.json');

  // read phase
  const srcProject = read(option.srcBasePath, configFileName);
  console.log(srcProject.sourceFiles.map((sourceFile) => sourceFile.fileName));

  // transform phase
  const distProject = transform(
    srcProject,
    option.distPath || option.srcBasePath,
  );

  // write phase
  if (option.distPath) write(distProject);
}

checkEnv({
  srcBasePath: resolve('fixtures/src/5-multiple-lib'),
  distPath: resolve('fixtures/dist/5-multiple-lib'),
});
