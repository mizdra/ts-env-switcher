import ts from 'typescript';

export type Project = Readonly<{
  basePath: string;
  // tsconfig.json
  config: {
    readonly fileName: string;
    readonly files: string[];
    readonly compilerOptions: ts.CompilerOptions;
  };
  // package.json
  packages: {
    readonly fileName: string;
    readonly raw: string;
  }[];
  sourceFiles: readonly ts.SourceFile[];
}>;

export type SwitchDirective = {
  '-lib'?: string[];
};
