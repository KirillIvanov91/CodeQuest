# CodeQuest — Telegram Mini App (MVP)

Геймифицированная платформа внутри Telegram WebApp: направления (JS, Git, SQL, Node.js, React),
уровни (Bronze→Diamond), подуровни, мини-задания и босс-задания. В этом MVP реализованы:
- Telegram WebApp интеграция (initData)
- Базовый фронтенд (vanilla JS) с редактором кода и проверкой
- Сервер на Node.js/Express
- Хранение контента в JSON (seed)
- Тест-раннер с песочницей (Node vm) для JS-задач
- Простая монетизация-заглушка (эндпоинты/структура)
- Готовность к деплою (Dockerfile, Procfile)

## Быстрый старт (локально)

1) Установи зависимости:
```bash
npm i
```

2) Создай `.env` в корне (см. `.env.example`). Обязательно укажи:
```
BOT_TOKEN=ВАШ_ТОКЕН_БОТА
WEBAPP_URL=http://localhost:8080
PORT=8080
NODE_ENV=development
ALLOW_DEBUG_NO_INITDATA=true
```

3) Запусти сервер:
```bash
npm run dev
```
Открой `http://localhost:8080` — это фронтенд WebApp.

> В режиме `ALLOW_DEBUG_NO_INITDATA=true` подпись Telegram не проверяется строго,
> чтобы было удобно разрабатывать локально в браузере.

## Подключение к Telegram

1) В BotFather:
- /newbot → получи `BOT_TOKEN`
- /setdomain или /setmenubutton для WebApp (укажи публичный URL, например от ngrok/Render/Fly)
- /setcommands (необязательно)

2) В своём боте отправь пользователю кнопку, открывающую WebApp, или просто
открой публичный URL фронтенда — Telegram передаст `initData` если открыто из бота.

## Деплой варианты
- Docker:
```bash
docker build -t codequest-miniapp .
docker run -p 8080:8080 --env-file .env codequest-miniapp
```
- Render/Railway/Fly/Heroku: просто задеплой код, укажи переменные окружения.
- Procfile для платформ, где нужен `web: node server/index.js`.

## Структура
```
codequest-miniapp/
  server/
    index.js
    verifyTelegram.js
    sandbox.js
    routes/
      auth.js
      content.js
      tasks.js
      pay.js
    data/seed.json
    tests/ (минимальные mocha-тесты)
  webapp/
    index.html
    app.js
    styles.css
  .env.example
  package.json
  Dockerfile
  Procfile
```

## Ограничения MVP
- Выполнение кода поддерживает только JS-задачи (без внешних require).
- Монетизация — заглушка (структура и проверки entitlement), без реальных платежей.
- Бэкенд хранит контент в JSON-файле (в реале вынеси в БД).

Удачи! 🚀
