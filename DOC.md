# gin-nuxt — Frontend Documentation

## Запуск

```bash
# Dev
BUILD_PROFILE=business,work npx nuxi dev

# Production
BUILD_PROFILE=business,work npx nuxi build
BUILD_PROFILE=business,work npx nuxi start
```

Переменные окружения:

| Переменная | По умолчанию | Описание |
|---|---|---|
| `BUILD_PROFILE` | `all` | Список активных модулей через запятую |
| `MODULE_VIEW` | `flats:grid,work:list,business:list` | Режим отображения листинга: `grid` или `list` |
| `NUXT_PUBLIC_API_BASE` | `http://localhost:7070` | URL бекенда |

### MODULE_VIEW

Задаёт режим отображения карточек для каждого модуля. Формат: `модуль:режим`, разделитель — запятая.

```bash
MODULE_VIEW=flats:grid,work:list,business:list   # дефолт
MODULE_VIEW=flats:list,work:grid                 # кастомная конфигурация
MODULE_VIEW=flats:grid                           # остальные берут дефолт
```

Режимы:
- `grid` — сетка карточек с фото (3 колонки, 3 объявления на главной)
- `list` — список строк (5 объявлений на главной)

Наличие фото в карточке определяется типом модуля, а не режимом: `flats` и `work` — с фото, `business` — без.

Читается через `composables/useModuleDisplay.ts`.

---

## Архитектура

```
pages/
  index.vue            — главная: список разделов или редирект
  flats/               — модуль недвижимости
  business/            — модуль бизнеса
  work/                — модуль работы
layouts/
  default.vue          — хедер с навигацией, футер
composables/
  useApi.ts            — все запросы к API
constants/
  modules.ts           — константы названий модулей
assets/css/themes/
  classifieds.css      — тема для профиля flats
  business.css         — тема для профилей business/work
error.vue              — страница ошибки (production)
nuxt.config.ts         — build-time конфигурация профилей
```

---

## Система профилей (BUILD_PROFILE)

Профиль задаётся **при сборке** и определяет какие страницы, CSS и навигация попадают в бандл. Мёртвый код выключенных модулей не включается в production-сборку.

### Доступные модули

| Модуль | Значение | Страницы | Тема |
|---|---|---|---|
| Недвижимость | `flats` | `/flats`, `/flats/:id` | `classifieds.css` |
| Бизнес | `business` | `/business`, `/business/:id` | `business.css` |
| Работа | `work` | `/work`, `/work/:id` | `business.css` |

### Комбинации

```bash
BUILD_PROFILE=all             # все модули
BUILD_PROFILE=business,work   # бизнес-портал
BUILD_PROFILE=flats           # сайт недвижимости
BUILD_PROFILE=business,work,flats  # всё вместе
```

### Как работает под капотом (`nuxt.config.ts`)

1. **CSS** — тема подключается условно: `business.css` если есть business или work, `classifieds.css` если есть flats
2. **pages:extend** — страницы выключенных модулей удаляются из роутера на этапе сборки
3. **runtimeConfig** — `buildProfile` передаётся в клиент для условного рендера навигации

### Проверка в компонентах

```ts
import { MODULE_BUSINESS, MODULE_WORK, MODULE_ALL } from '~/constants/modules'

const profile = useRuntimeConfig().public.buildProfile as string
const hasModule = (m: string) =>
  profile === MODULE_ALL || profile.split(',').map(s => s.trim()).includes(m)

const hasBusiness = hasModule(MODULE_BUSINESS)
```

---

## Шапка (layouts/default.vue)

Шапка содержит:
- **Лого** — слева, ведёт на `/`
- **Навигация по модулям** — по центру (скрывается на mobile, дублируется в строке под шапкой)
- **Кнопка "Подать объявление"** — ведёт на `/profile/posts/create`
- **Auth-блок** — определяется на клиенте по наличию `localStorage.token`:
  - Не авторизован: кнопка "Войти" → `/login`
  - Авторизован: ссылка "Профиль" + кнопка "Выйти" (очищает токены)

---

## Главная страница (pages/index.vue)

Логика:
- **1 модуль активен** → редирект сразу на него (`/work`, `/business`, `/flats`)
- **2+ модуля** → тулбар категорий + секции с последними объявлениями

### Тулбар категорий

Горизонтальная прокручиваемая строка под шапкой. Отображает дочерние категории каждого активного раздела (fetching `fetchCategoryTree` по rootId). Каждый чип ведёт на `/category/:id`. Sticky — остаётся видимым при прокрутке.

### Формат отображения секций

| Модуль | Кол-во | Формат |
|---|---|---|
| Недвижимость | 3 | Сетка 3 колонки с фото |
| Работа | 4 | Список строк с аватаром (48×48) |
| Бизнес | 5 | Список строк без фото |

### Корневые ID категорий

| Модуль | rootId |
|---|---|
| business | 52 |
| work | 60 |
| flats | 11 |

---

## API-слой (composables/useApi.ts)

Все запросы идут через `apiFetch` — приватную функцию которая строит полный URL через `URL` + `searchParams` и передаёт его в `$fetch` строкой. Это обеспечивает корректную работу как в SSR (`useAsyncData`), так и на клиенте.

```ts
// Внутренний примитив — не использовать напрямую вне useApi.ts
async function apiFetch<T>(path: string, params?: Record<string, string | undefined>): Promise<T>
```

### Публичные функции

```ts
fetchCategoryTree(categoryId?)             // дерево категорий
fetchCategoryPosts(categoryId, query)      // список объявлений категории
fetchRecentCategoryPosts(categoryId, limit) // последние N объявлений (с recursive=true)
fetchPublicPosts(query)                    // все объявления
fetchPostDetails(postId)                   // одно объявление
```

### Параметры листинга

`fetchCategoryPosts` принимает `query: Record<string, string>`. Поддерживаемые ключи:

| Ключ | Описание |
|---|---|
| `page` | Номер страницы (от 1) |
| `search` | Текстовый поиск |
| `priceFrom` / `priceTo` | Диапазон цены |
| `recursive` | `"true"` — включать подкатегории |
| `employment` | Тип занятости (1/2/3), только для work |
| `isRemote` | `"true"` — только удалённая работа |

---

## Добавление нового модуля

1. **Константа** — добавить в `constants/modules.ts`:
   ```ts
   export const MODULE_SERVICE = 'service'
   ```

2. **Страницы** — создать `pages/service/index.vue` и `pages/service/[id].vue`

3. **nuxt.config.ts** — добавить в `buildConfig` и `pages:extend`:
   ```ts
   hasService: hasModule(MODULE_SERVICE)
   // ...
   if (!buildConfig.hasService) removeAll('/pages/service/')
   ```

4. **CSS** — если нужна отдельная тема, создать `assets/css/themes/service.css` и подключить условно

5. **Навигация** — добавить ссылку в `layouts/default.vue`:
   ```html
   <NuxtLink v-if="hasService" to="/service" class="nav-link">Сервис</NuxtLink>
   ```

6. **Главная** — добавить раздел в `SECTION_DEFS` в `pages/index.vue`:
   ```ts
   {
     module: MODULE_SERVICE,
     enabled: hasModule(MODULE_SERVICE),
     to: '/service',
     label: 'Сервис',
     rootId: XX,
     hasPhoto: false,  // true — показывать аватар в списке
     isGrid: false,    // true — сетка с фото (только если hasPhoto)
     limit: 5          // кол-во элементов на главной
   }
   ```

---

## Динамические поля (PartDetails)

Компонент `components/part-details.vue` автоматически отображает part-поля объявления без хардкода.

**Использование на детальных страницах:**
```html
<PartDetails :category-id="post.categoryID" :part="post.part" />
```

**Как работает:**
1. Запрашивает `/v1/public/category/:id/fields` для получения метаданных полей
2. Фильтрует базовые поля поста (`title`, `description`, `price`, `regionID`)
3. Для каждого поля рендерит `fieldName: значение`
4. Форматирует по типу: `checkbox` → Да/Нет, `select` → лейбл из `values`, остальное → строка

**Добавление поля:** достаточно добавить тег `itype`/`iname` на бекенде — фронт подхватит без правок.

---

## Нормализация данных

`normalizePost` в `useApi.ts` обрабатывает два формата ответа бекенда:

- `{ post: {...}, part: {...} }` — детальная страница (`/posts/get-one/:id`), part-поля для flats хардкодированы
- `{ id, title, ... }` — плоский объект из листинга

При добавлении поля в `part_jobs` или `part_flats` на бекенде необходимо:
- Для **flats**: обновить `normalizePost` в `useApi.ts` и `getFlatAttributes` в `utils/format.ts`
- Для **work**: обновить шаблон `pages/work/[id].vue`
- Для **business**: обновить шаблон `pages/business/[id].vue`
