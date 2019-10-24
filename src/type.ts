import ts from 'typescript';

export type Project = Readonly<{
  basePath: string;
  config: {
    readonly name: string;
    readonly parsedCommandLine: ts.ParsedCommandLine;
  };
  sourceFiles: readonly ts.SourceFile[];
}>;
