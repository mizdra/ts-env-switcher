import ts from 'typescript';
import { read } from './read';
import { transform } from './transform';
import { write } from './write';

const fixtureSrcPath = 'fixtures/src/2-include-index.ts';
const fixtureDistPath = 'fixtures/dist/2-include-index.ts';

const configFileName = ts.findConfigFile(
  /*searchPath*/ fixtureSrcPath,
  ts.sys.fileExists,
  'tsconfig.json',
);
if (!configFileName) throw new Error('tsconfig.json が見つかりません');

// read phase
const srcProject = read(fixtureSrcPath, configFileName);
console.log(srcProject.sourceFiles.map((sourceFile) => sourceFile.fileName));

// transform phase
const distProject = transform(srcProject, fixtureDistPath);

// write phase
write(distProject);
