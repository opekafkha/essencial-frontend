import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import ts from 'typescript'

// Compile in memory, so Node can exercise the actual TS/TSX sources without
// generating files or requiring a second application build.
export function loadTypeScript(path, { imports = {}, env = {} } = {}) {
  function moduleUrl(filename) {
    const result = ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
      fileName: filename,
    })
    const code = result.outputText
      .replace(/import ["'](?:[^"']*\.css|@livekit\/components-styles)["'];?/g, '')
      .replaceAll('import.meta.env', JSON.stringify(env))
      .replace(/from (["'])([^"']+)\1/g, (_match, _quote, specifier) => {
      let url
      if (imports[specifier]) {
        url = imports[specifier]
      } else if (specifier.startsWith('.')) {
        const base = resolve(dirname(filename), specifier)
        const source = [base, `${base}.ts`, `${base}.tsx`].find(existsSync)
        if (!source) throw new Error(`Missing test import: ${specifier}`)
        url = moduleUrl(source)
      } else {
        url = import.meta.resolve(specifier)
      }
      return `from ${JSON.stringify(url)}`
    })
    return `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
  }
  return import(moduleUrl(resolve(path)))
}
