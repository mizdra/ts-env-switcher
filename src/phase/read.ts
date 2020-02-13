import ts from 'typescript';
import { Project } from '../type';
import { basename, join, relative } from 'path';
import { isSubDirectory } from '../lib/path';

const parseConfigHost: ts.ParseConfigHost = {
  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,
  readDirectory: ts.sys.readDirectory,
  useCaseSensitiveFileNames: true,
};

export function read(basePath: string, configFileName: string): Project {
  const configFile = ts.readConfigFile(configFileName, ts.sys.readFile);
  const parsedCommandLine = ts.parseJsonConfigFileContent(configFile.config, parseConfigHost, basePath);

  const packages: { readonly fileName: string; readonly raw: string }[] = [];

  const compilerHost = ts.createCompilerHost(parsedCommandLine.options);
  const program = ts.createProgram(parsedCommandLine.fileNames, parsedCommandLine.options, {
    ...compilerHost,
    getCurrentDirectory: () => {
      return join(basePath);
    },
    getDefaultLibLocation: () => {
      return join(basePath, 'node_modules/typescript/lib');
    },
    readFile: (fileName: string) => {
      const raw = compilerHost.readFile(fileName);
      if (basename(fileName) === 'package.json' && isSubDirectory(basePath, fileName)) {
        if (raw === undefined) throw new Error(`${fileName} の読み取りに失敗しました`);
        packages.push({ fileName: join(basePath, relative(basePath, fileName)), raw });
      }
      return raw;
    },
  });
  const sourceFiles = program
    .getSourceFiles()
    // `basePath` より上のディレクトリのファイルは除外する
    .filter((sourceFile) => {
      return isSubDirectory(basePath, sourceFile.fileName);
    })
    // 絶対パスが混ざっていることがあるので, 相対パスに正規化する
    .map((sourceFile) => {
      return {
        ...sourceFile,
        fileName: join(basePath, relative(basePath, sourceFile.fileName)),
      };
    });

  return {
    basePath,
    config: {
      fileName: configFileName,
      files: parsedCommandLine.fileNames,
      compilerOptions: parsedCommandLine.options,
    },
    packages,
    sourceFiles,
  };
}
