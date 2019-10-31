import ts from 'typescript';

export type Project = Readonly<{
  basePath: string;
  // tsconfig.json
  config: {
    readonly fileName: string;
    readonly parsedCommandLine: ts.ParsedCommandLine;
  };
  // package.json
  packages: {
    readonly fileName: string;
    readonly raw: string;
  }[];
  sourceFiles: readonly ts.SourceFile[];
}>;
