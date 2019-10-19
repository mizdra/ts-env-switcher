import { read } from './read';
import { transform } from './transform';
import { write } from './write';
import { join } from 'path';

type Option = {
  srcBasePath: string;
  distPath?: string;
};
function checkEnv(option: Option) {
  const configFileName = join(option.srcBasePath, 'tsconfig.json');

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
  srcBasePath: 'fixtures/src/3-include-multiple',
  distPath: 'fixtures/dist/3-include-multiple',
});
