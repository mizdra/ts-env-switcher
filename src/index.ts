import ts from 'typescript';
import { join, relative } from 'path';

const fixtureSrcPath = 'fixtures/src/2-include-index.ts';
const fixtureDistPath = 'fixtures/dist/2-include-index.ts';

const configFileName = ts.findConfigFile(
  /*searchPath*/ fixtureSrcPath,
  ts.sys.fileExists,
  'tsconfig.json',
);

if (!configFileName) throw new Error('tsconfig.json が見つかりません');

const configFile = ts.readConfigFile(configFileName, ts.sys.readFile);

const parseConfigHost: ts.ParseConfigHost = {
  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,
  readDirectory: ts.sys.readDirectory,
  useCaseSensitiveFileNames: true,
};
const compilerOptions = ts.parseJsonConfigFileContent(
  configFile.config,
  parseConfigHost,
  fixtureSrcPath,
);

console.log('configFileName =', configFileName);
console.log('configFile =', configFile);
console.log('compilerOptions =', compilerOptions);

const program = ts.createProgram(
  compilerOptions.fileNames,
  compilerOptions.options,
);

const sourceFile = program.getSourceFile(
  'fixtures/src/2-include-index.ts/index.ts',
);
if (!sourceFile) throw new Error('sourceFile が見つかりません');

const printer = ts.createPrinter();

const code = printer.printFile(sourceFile);
console.log(sourceFile.fileName);

ts.sys.writeFile(
  join(fixtureDistPath, relative(fixtureSrcPath, sourceFile.fileName)),
  code,
);
