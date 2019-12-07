import ts from 'typescript';
import { Project } from './type';
import { isSubDirectory } from './lib/path';
import { warning } from './lib/logger';
import { relative, join } from 'path';

export function write({ basePath, config, packages, sourceFiles }: Project, distBasePath: string) {
  // プロジェクト外のファイルかどうか
  function isExternalFile(fileName: string) {
    return fileName.startsWith('..');
  }
  function transformPath(fileName: string) {
    // 外部モジュールの場合は変換せずに返す
    if (isExternalFile(fileName)) return fileName;

    return join(distBasePath, relative(basePath, fileName));
  }
  function createTsConfig(): any {
    return (ts as any).generateTSConfig(
      config.compilerOptions,
      config.files.map((file) => relative(basePath, file)),
      '\n',
    );
  }

  // configFile
  ts.sys.writeFile(transformPath(config.fileName), createTsConfig());

  // packages
  packages.forEach((pkg) => {
    if (isExternalFile(pkg.fileName)) {
      warning(`${pkg.fileName} は外部ファイルのため, 書き込みをスキップしました`);
      return;
    }
    ts.sys.writeFile(pkg.fileName, pkg.raw);
  });

  // sourceFiles
  sourceFiles.forEach((sourceFile) => {
    if (isExternalFile(sourceFile.fileName)) {
      warning(`${sourceFile.fileName} は外部ファイルのため, 書き込みをスキップしました`);
      return;
    }
    ts.sys.writeFile(transformPath(sourceFile.fileName), sourceFile.text);
  });
}
