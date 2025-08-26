const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

const state = {
  bootstrap: null,
  selectedTask: null,
};

const els = {
  auth: document.getElementById('auth'),
  btnVerify: document.getElementById('btn-verify'),
  authStatus: document.getElementById('auth-status'),
  directions: document.getElementById('directions'),
  dirList: document.getElementById('dir-list'),
  tasks: document.getElementById('tasks'),
  taskTitle: document.getElementById('task-title'),
  taskStatement: document.getElementById('task-statement'),
  code: document.getElementById('code'),
  btnSubmit: document.getElementById('btn-submit'),
  btnBack: document.getElementById('btn-back'),
  taskResult: document.getElementById('task-result'),
};

function show(section) {
  [els.auth, els.directions, els.tasks].forEach(s => s.classList.add('hidden'));
  section.classList.remove('hidden');
}

async function callApi(path, options = {}) {
  const res = await fetch(path, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json();
}

async function verify() {
  els.authStatus.textContent = 'Проверяем Telegram...';
  const initData = tg?.initData || ''; // пусто в локальной разработке
  try {
    const ans = await callApi('/api/auth/verify', { method: 'POST', body: { initData } });
    if (!ans.ok) throw new Error(ans.error);
    els.authStatus.textContent = 'OK!';
    await bootstrap();
  } catch (e) {
    els.authStatus.textContent = 'Dev режим: продолжаем без initData';
    await bootstrap();
  }
}

async function bootstrap() {
  const data = await callApi('/api/content/bootstrap');
  state.bootstrap = data;
  renderDirections();
  show(els.directions);
}

function renderDirections() {
  const dirs = state.bootstrap.directions || [];
  els.dirList.innerHTML = '';
  for (const d of dirs) {
    if (d.dkey !== 'js') continue; // MVP: показываем только JS
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h3>${d.title}</h3><p>${d.description}</p><p style="margin-top:6px;font-size:12px;color:#95a0ff">MVP: открыт только JS</p>`;
    card.onclick = () => openJsSampleTasks();
    els.dirList.appendChild(card);
  }
}

function findTaskById(id) {
  const t = state.bootstrap.tasks.find(x => x.id === id);
  if (t) return t;
  return state.bootstrap.boss_tasks.find(x => x.id === id);
}

function openTask(taskId) {
  const task = findTaskById(taskId);
  state.selectedTask = task;
  els.taskTitle.textContent = task.title;
  els.taskStatement.textContent = task.statement + '\n\nПример: ' + (task.examples?.[0] ? JSON.stringify(task.examples[0]) : '-');
  els.code.value = `// Напиши функцию ${task.fnName} здесь\nfunction ${task.fnName}() {\n  // ...\n}\n`;
  els.taskResult.textContent = '';
  show(els.tasks);
}

function openJsSampleTasks() {
  // Покажем список минимального набора задач (MVP)
  const jsTasks = state.bootstrap.tasks
    .filter(t => [1001, 1002, 2001, 3001, 4001].includes(t.id));
  els.dirList.innerHTML = '';
  for (const t of jsTasks) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h3>${t.title}</h3><p>${t.statement.substring(0,70)}...</p>`;
    card.onclick = () => openTask(t.id);
    els.dirList.appendChild(card);
  }
  // Добавим boss Bronze
  const boss = state.bootstrap.boss_tasks.find(b => b.id === 9001);
  if (boss) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h3>Boss: ${boss.title}</h3><p>${boss.statement.substring(0,70)}...</p>`;
    card.onclick = () => openTask(boss.id);
    els.dirList.appendChild(card);
  }
  show(els.directions);
}

// Handlers
els.btnVerify.onclick = verify;
els.btnBack.onclick = () => show(els.directions);
els.btnSubmit.onclick = async () => {
  const code = els.code.value;
  const task = state.selectedTask;
  els.taskResult.textContent = 'Проверяем...';
  try {
    const ans = await callApi(`/api/tasks/${task.id}/submit`, { method: 'POST', body: { code } });
    if (!ans.ok) throw new Error(ans.error || 'unknown');
    const { status, report } = ans;
    els.taskResult.textContent = JSON.stringify({ status, report }, null, 2);
    if (tg && status === 'passed') tg.HapticFeedback?.notificationOccurred('success');
    if (tg && status === 'failed') tg.HapticFeedback?.notificationOccurred('error');
  } catch (e) {
    els.taskResult.textContent = 'Ошибка: ' + e.message;
  }
};

// Авто-старт: в браузере можно сразу нажать verify
