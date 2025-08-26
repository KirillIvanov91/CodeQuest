import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runInSandbox } from '../sandbox.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, '..', 'data', 'seed.json');

function loadData() {
  const raw = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw);
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function buildHarnessForTask(task, payload) {
  // Generates JS code that runs tests and returns a report object
  const fnName = task.fnName;
  const tests = task.tests || [];
  // Special handling for async test in myPromiseAll
  if (task.fnName === 'myPromiseAll') {
    return `
(async () => {
  try {
    if (typeof ${fnName} !== 'function') throw new Error('Function ${fnName} is not defined');
    // basic test:
    const p1 = new Promise(res => setTimeout(() => res(1), 10));
    const p2 = Promise.resolve(2);
    const p3 = Promise.resolve(3);
    const out = await ${fnName}([p1, p2, p3]);
    const ok = Array.isArray(out) && out.length === 3 && out[0] === 1 && out[1] === 2 && out[2] === 3;
    return { passed: ok, tests: [{name:'basic', passed: ok}], error: ok ? null : 'Wrong result' };
  } catch (e) {
    return { passed: false, tests: [{name:'basic', passed: false}], error: e.message };
  }
})()
`;
  }

  const testsSerialized = JSON.stringify(tests);
  return `
(() => {
  const tests = ${testsSerialized};
  const results = [];
  let allPassed = true;
  if (typeof ${fnName} !== 'function') {
    return { passed: false, tests: [], error: 'Function ${fnName} is not defined' };
  }
  for (const t of tests) {
    const input = Array.isArray(t.in) ? t.in : [t.in];
    let out;
    try {
      out = ${fnName}.apply(null, input);
    } catch (e) {
      allPassed = false;
      results.push({ name: JSON.stringify(input), passed: false, error: e.message });
      continue;
    }
    const expected = t.out;
    const ok = JSON.stringify(out) === JSON.stringify(expected);
    if (!ok) allPassed = false;
    results.push({ name: JSON.stringify(input), passed: ok, got: out, expected });
  }
  return { passed: allPassed, tests: results };
})()
`;
}

const router = Router();

router.post('/:taskId/submit', async (req, res) => {
  const { code } = req.body || {};
  if (typeof code !== 'string' || code.length > 10000) {
    return res.status(400).json({ ok: false, error: 'invalid_code' });
  }
  const data = loadData();
  const taskId = Number(req.params.taskId);
  const task = (data.tasks || []).find(t => t.id === taskId) || (data.boss_tasks || []).find(t => t.id === taskId);
  if (!task) return res.status(404).json({ ok: false, error: 'task_not_found' });

  const harness = buildHarnessForTask(task, req.body);
  const report = await runInSandbox({ code, harness, timeoutMs: 1500 });
  const status = report && report.passed ? 'passed' : 'failed';
  res.json({ ok: true, status, report });
});

export default router;
