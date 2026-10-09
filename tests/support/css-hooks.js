// Node module-customisation hook: world modules `import './x.css'` (handled by Vite in the
// browser build). In Node tests those imports resolve to an empty module so the real world
// modules can be imported and exercised without a bundler.
export async function load(url, context, nextLoad) {
  if (url.endsWith('.css')) {
    return { format: 'module', source: 'export default "";', shortCircuit: true };
  }
  return nextLoad(url, context);
}
