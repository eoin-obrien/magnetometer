/// <reference types="nativewind/types" />

declare module "glslify" {
  export default (arg: TemplateStringsArray, opts?: Record<string, any>) =>
    string;
}
