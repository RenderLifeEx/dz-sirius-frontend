# dz-sirius-frontend

Фронтенд приложения «Домашнее задание для 3Л класса».

## Стек

- **React 19** + **Vite 8**
- **StyleX** — все стили только через StyleX, без CSS-файлов
- **pnpm** — менеджер пакетов
- **Node.js 22**

## Структура

```
src/
├── api.js                        # Запросы к API (fetchNextNotification, fetchAvailableDays, postSendNow)
├── theme.js                      # ThemeContext, useTheme, useThemeProvider
├── App.jsx                       # Корневой компонент
└── components/
    ├── NotificationPanel.jsx     # Панель следующей отправки с прогрессбаром
    ├── ConfirmModal.jsx          # Модалка подтверждения отправки
    ├── HomeworkList.jsx          # Список ДЗ по дням
    ├── ThemeToggle.jsx           # Кнопка переключения темы
    └── Toast.jsx                 # Тост-уведомление
```

## Запуск

```bash
# Установка зависимостей
pnpm install

# Локальная разработка (API: http://localhost:3000)
pnpm dev

# Локальная разработка с продовым API
pnpm dev:prod

# Сборка для продакшена
pnpm build
```

## Конфигурация

Базовый URL API задаётся через переменную окружения `VITE_API_BASE_URL`.

| Файл | Режим | Значение по умолчанию |
|---|---|---|
| `.env.local` | `pnpm dev` | `http://localhost:3000` |
| `.env.production` | `pnpm build` | `https://dz.renderlife.ru` |

Скопируйте `.env.example` и настройте под себя:

```bash
cp .env.example .env.local
```

## API

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/next-notification` | Дата/время следующей запланированной отправки |
| POST | `/api/send-now` | Отправить сейчас. Body: `{ code: string }` |
| GET | `/api/available-days` | Список дней с домашним заданием |

## Деплой

Деплой через GitHub Actions при пуше тега вида `*-prod`:

```bash
git tag v1.0.0-prod
git push origin v1.0.0-prod
```

Необходимые секреты в репозитории:

| Секрет | Описание |
|---|---|
| `VITE_API_BASE_URL` | URL продового API |
| `HOST` | IP/хост сервера |
| `USERNAME` | Пользователь SSH |
| `PASSWORD` | Пароль SSH |
| `SSH_PORT` | Порт SSH |
| `ALBD_TG_CHAT_ID` | ID Telegram-чата для уведомлений |
| `TG_BOT_TOKEN` | Токен Telegram-бота |
