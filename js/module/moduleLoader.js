const moduleCache = new Map();

export async function loadModule(modulePath) {
  if (!moduleCache.has(modulePath)) {
    const module = await import(modulePath);
    moduleCache.set(modulePath, module);
  }
  return moduleCache.get(modulePath);
}