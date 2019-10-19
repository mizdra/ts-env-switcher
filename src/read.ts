import ts from 'typescript';

export function read(configFileName: string, basePath: string) {
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
    basePath,
  );
  return { compilerOptions };
}
