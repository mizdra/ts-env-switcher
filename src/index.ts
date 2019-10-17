import ts from 'typescript';

const configPath = ts.findConfigFile(
  /*searchPath*/ './fixtures/src/1-minimum',
  ts.sys.fileExists,
  'tsconfig.json',
);

console.log(configPath);

// ts.createWatchCompilerHost;
// ts.createCompilerHost();
