import ts from 'typescript';
import { Project } from './type';

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
  const program = ts.createProgram(
    parsedCommandLine.fileNames,
    parsedCommandLine.options,
  );
  const sourceFiles = program.getSourceFiles();

  return {
    basePath,
    configFile: {
      name: configFileName,
      parsedCommandLine,
    },
    sourceFiles,
  };
}
