import vm from 'vm';

/**
 * runInSandbox executes user code safely (best-effort) with timeout.
 * Supports only plain JS (no require, no fs, no network).
 */
export async function runInSandbox({ code, harness, timeoutMs = 1000 }) {
  // Prepare sandbox context
  const sandbox = {
    console: {
      log: (...args) => { /* swallow or collect logs */ },
      error: (...args) => { /* swallow */ }
    },
    setTimeout,
    Promise,
  };
  const context = vm.createContext(sandbox, { name: 'codequest-sandbox' });

  // Compose full source: user code + harness
  const fullSource = `${code}\n;\n${harness}\n`;

  try {
    const script = new vm.Script(fullSource, { timeout: timeoutMs });
    const result = script.runInContext(context, { timeout: timeoutMs });
    if (result && typeof result.then === 'function') {
      // If harness returns promise
      return await Promise.race([
        result,
        new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout')), timeoutMs))
      ]);
    }
    return result;
  } catch (err) {
    return { passed: false, error: err.message ?? String(err), tests: [] };
  }
}
