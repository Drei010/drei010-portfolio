import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

const projectRoot = resolve(import.meta.dirname, "..");
export const projectRequire = createRequire(import.meta.url);
const moduleCache = new Map();

export function loadTypeScriptModule(relativePath) {
  const absolutePath = resolve(projectRoot, relativePath);
  if (moduleCache.has(absolutePath)) return moduleCache.get(absolutePath).exports;

  const source = readFileSync(absolutePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: absolutePath,
  }).outputText;
  const compiledModule = { exports: {} };
  moduleCache.set(absolutePath, compiledModule);

  function localRequire(specifier) {
    if (specifier.startsWith("@/")) {
      const aliasPath = specifier.slice(2);
      return loadTypeScriptModule(
        aliasPath.endsWith(".ts") ? aliasPath : `${aliasPath}.ts`
      );
    }
    if (!specifier.startsWith(".")) return projectRequire(specifier);
    const dependencyPath = resolve(absolutePath, "..", specifier);
    const withExtension = dependencyPath.endsWith(".ts")
      ? dependencyPath
      : `${dependencyPath}.ts`;
    return loadTypeScriptModule(withExtension.slice(projectRoot.length + 1));
  }

  const evaluate = new Function("require", "module", "exports", output);
  evaluate(localRequire, compiledModule, compiledModule.exports);
  return compiledModule.exports;
}
