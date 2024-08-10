# Rest API для Mini App

## Доступные методы

1. `GET /api/posts`
    - Возвращает списко постов пользователя в JSON формате.

2. `GET /api/posts/{postId}`
    - Возвращает пост в JSON формате.

3. `POST /api/posts`
    - Добавляет пост в базу данных.
    - Принимает JSON объект с полями `title`, `content` и `publishing_date`, `media`, `groups`.
    - Возвращает JSON объект с полем `id` добавленного поста.

4. `DELETE /api/posts/{postId}`
    - Удаляет пост из базы данных по его `id`.

5. `POST /api/posts/files`
    - Принимает файлы для загрузки в формате `multipart/form-data`.
    - Возвращает массив JSON объектов с полями `file_id` и `type` загруженного файла. 
    
6. `GET /api/user/groups`
    - Возвращает список групп пользователя в JSON формате.
