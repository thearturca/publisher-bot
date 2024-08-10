# Телеграм бот Публикатор

Этот репозиторий является результатом выполнения тестового задания

## Состав проекта

Проект состоит из следующих packages/apps:

### Apps and Packages

- `web`: [Next.js](https://nextjs.org/) приложение. Является фронтенд частью бота.
- `backend`: [Express.js](https://expressjs.com/) сервер. Является бэкенд частью бота.
- `bot`: [Grammy](https://grammy.dev/) бот. Обрабатывает добваления бота в группу и команду `/start`.Является фронтенд частью бота
- `publihser`: Сервис для публикации запланированных постов в канал. Является бэкенд частью бота.
- `migrator`: Сервис для миграции базы данных. Является бэкенд частью бота.
- `@repo/db`: [Kysely](https://kysely.org/) база данных. Типы для БД. Является бэкенд частью бота.
- `@repo/types`: Схемы валидации данных для общения между сервисами.
- `@repo/services`: Различные сервисы. Является бэкенд частью бота.
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Каждый пакет написан на языке [TypeScript](https://www.typescriptlang.org/).

### Configuration
Проект использует конфигурацию через переменные среды.
Пример конфигурации можно посмотреть в [.env](.env.example)

### Build

Для сборки приложений и пакетов, нужно запустить следующую команду:

```
pnpm build
```

### Develop

Прежде всего нужно создать учётную запись на тестовом бэкенде Telegram. [Инструкция](https://docs.telegram-mini-apps.com/platform/test-environment).
В тестовом сервере нужно создать бота с помощью BotFather, и токен сохранить в переменную окружения `TG_TOKEN_TEST`.

Так же понадобиться СУБД PostgreSQL. Можете поднять свой инстанс или запустить контейнер.
```
docker-compose up -d
```

Для запуска бота в режиме разработки, нужно запустить следующую команду:

```
pnpm dev
```

Затем написать `/start` боту, чтобы получить доступ к Mini App.
