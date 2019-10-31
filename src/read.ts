import ts from 'typescript';
import { Project } from './type';
import { basename } from 'path';

const parseConfigHost: ts.ParseConfigHost = {
  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,
  readDirectory: ts.sys.readDirectory,
  useCaseSensitiveFileNames: true,
};

export function read(basePath: string, configFileName: string): Project {
  const configFile = ts.readConfigFile(configFileName, ts.sys.readFile);
  const parsedCommandLine = ts.parseJsonConfigFileContent(
    configFile.config,
    parseConfigHost,
    basePath,
  );
  const compilerHost = ts.createCompilerHost(parsedCommandLine.options);
  const program = ts.createProgram(
    parsedCommandLine.fileNames,
    parsedCommandLine.options,
    {
      ...compilerHost,
      readFile: (fileName: string) => {
        if (basename(fileName) === 'package.json') {
          console.log(fileName);
        }
        return compilerHost.readFile(fileName);
      },
    },
  );
  const sourceFiles = program.getSourceFiles();

  return {
    basePath,
    config: {
      fileName: configFileName,
      parsedCommandLine,
    },
    sourceFiles,
  };
}
