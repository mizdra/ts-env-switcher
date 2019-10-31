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

  const packages: { readonly fileName: string; readonly raw: string }[] = [];
  const compilerHost = ts.createCompilerHost(parsedCommandLine.options);
  const program = ts.createProgram(
    parsedCommandLine.fileNames,
    parsedCommandLine.options,
    {
      ...compilerHost,
      readFile: (fileName: string) => {
        const raw = compilerHost.readFile(fileName);
        if (basename(fileName) === 'package.json') {
          if (raw === undefined)
            throw new Error(`${fileName} の読み取りに失敗しました`);
          packages.push({ fileName, raw });
        }
        return raw;
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
    packages,
    sourceFiles,
  };
}
