import ts from 'typescript';
import { read } from './read';
import { parse } from './parse';
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
const { compilerOptions } = read(configFileName, fixtureSrcPath);
console.log('compilerOptions =', compilerOptions);

// parse phase
const { program, sourceFiles } = parse(compilerOptions);
console.log(sourceFiles.map((sourceFile) => sourceFile.fileName));

// write phase
write(
  sourceFiles,
  compilerOptions,
  configFileName,
  fixtureSrcPath,
  fixtureDistPath,
);
