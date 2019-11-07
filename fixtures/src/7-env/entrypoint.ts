declare function Env(envName: string): (constructor: Function) => void;

@Env('dom')
class A {}

@Env('webworker')
class B {}
