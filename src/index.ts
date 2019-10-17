import ts from 'typescript';

const fixturePath = 'fixtures/src/2-include-index.ts';

const configFileName = ts.findConfigFile(
  /*searchPath*/ fixturePath,
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
  fixturePath,
);

console.log('configFileName =', configFileName);
console.log('configFile =', configFile);
console.log('compilerOptions =', compilerOptions);
