# 🚀 PLAN DE MIGRACIÓN A REACT SERVER COMPONENTS

**Fecha de inicio:** 5 de octubre, 2025  
**Rama:** `refactor/avoid-duplicates-n-use-context`  
**Tiempo estimado:** 3-4 horas  
**Impacto:** Eliminación de ~800 líneas de código complejo, mejora de performance y DX

---

## 📊 ANÁLISIS DE ARQUITECTURA ACTUAL

### Problemas Identificados

- ❌ **3 páginas con client-side fetching:** `/stories/mine`, `/stories`, `/story/new`
- ❌ **Hooks complejos:** `useMyStories`, `useMyStoriesPaged`, `useBufferedPagedStories` (~300 líneas)
  - Race conditions resueltas con `inProgressFetchesRef` Map
  - Múltiples refs y useEffects anidados
  - Lógica de deduplicación compleja
- ❌ **UserContext duplicado:** Lógica que Clerk ya maneja nativamente
- ❌ **5+ API routes:** Se pueden eliminar con Server Actions
- ❌ **Client-side fetching:** Causa loading states, race conditions, complejidad innecesaria
- ✅ **Ya implementado:** `/story/[id]/page.tsx` como RSC (buen inicio)

### Impacto Estimado

**Código a eliminar:**
```
❌ useBufferedPagedStories.ts     -200 líneas
❌ useMyStories.ts                 -80 líneas
❌ useMyStoriesPaged.ts            -70 líneas
❌ UserContext.tsx                 -60 líneas
❌ HomeAuth.tsx                    -40 líneas
❌ API routes                      -150 líneas
❌ Tests obsoletos                 -200 líneas
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:                            -800 líneas
```

**Código a crear:**
```
✅ lib/data/stories.ts            +150 líneas
✅ lib/data/chapters.ts           +50 líneas
✅ lib/data/comments.ts           +50 líneas
✅ app/actions.ts                 +100 líneas
✅ Client components               +200 líneas
✅ Tests nuevos                    +150 líneas
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:                            +700 líneas
```

**Balance neto:** -100 líneas (13% reducción)

**Beneficios:**
- ✅ Código más simple y mantenible
- ✅ Sin race conditions ni refs complejos
- ✅ Mejor performance (SSR, menos JS en cliente)
- ✅ Mejor SEO
- ✅ Type-safety end-to-end
- ✅ Cache automático de Next.js

---

## 📋 PLAN DE EJECUCIÓN

### FASE 1: PREPARACIÓN - DATA LAYER (30 min)

#### ✅ Step 1: Crear lib/data para data fetching server-side

**Archivos a crear:**
```
src/lib/data/
├── stories.ts      # getStories, getMyStories, getStory, deleteStory, etc.
├── chapters.ts     # getChapters, getChapter, updateChapter, etc.
├── comments.ts     # getComments, addComment, deleteComment
└── types.ts        # Shared types
```

**Funciones clave en stories.ts:**
```typescript
export async function getStories(opts: {
  skip?: number;
  limit?: number;
  q?: string;
}): Promise<{ stories: Story[]; total: number }>;

export async function getMyStories(
  userId: string,
  opts: { skip?: number; limit?: number }
): Promise<{ stories: Story[]; total: number }>;

export async function getStory(id: string): Promise<Story | null>;

export async function deleteStory(
  storyId: string,
  userId: string
): Promise<void>;

export async function createStory(
  data: CreateStoryInput,
  userId: string
): Promise<Story>;

export async function updateStory(
  storyId: string,
  data: UpdateStoryInput,
  userId: string
): Promise<Story>;

export async function toggleBravo(
  storyId: string,
  userId: string
): Promise<{ bravos: string[] }>;
```

**Ventajas:**
- Conexión directa a MongoDB (sin API routes intermedios)
- Reutilizable en Server Components y Server Actions
- Type-safe
- Fácil de testear

**Notas de implementación:**
- Reutilizar `src/lib/mongodb.ts` existente para conexión
- Manejar errores apropiadamente
- Agregar logging para debugging

---

### FASE 2: SERVER ACTIONS (20 min)

#### ✅ Step 2: Crear Server Actions para mutations

**Archivo:** `src/app/actions.ts`

```typescript
'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import * as storiesData from '@/lib/data/stories';
import * as commentsData from '@/lib/data/comments';

export async function deleteStoryAction(storyId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  
  await storiesData.deleteStory(storyId, userId);
  revalidatePath('/stories/mine');
  revalidatePath('/stories');
  return { success: true };
}

export async function deleteAllStoriesAction() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  
  await storiesData.deleteAllStories(userId);
  revalidatePath('/stories/mine');
  return { success: true };
}

export async function createStoryAction(data: CreateStoryInput) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  
  const story = await storiesData.createStory(data, userId);
  revalidatePath('/stories/mine');
  revalidatePath('/stories');
  return story;
}

export async function updateStoryAction(
  storyId: string,
  data: UpdateStoryInput
) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  
  const story = await storiesData.updateStory(storyId, data, userId);
  revalidatePath(`/story/${storyId}`);
  revalidatePath('/stories/mine');
  return story;
}

export async function toggleBravoAction(storyId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  
  const result = await storiesData.toggleBravo(storyId, userId);
  revalidatePath(`/story/${storyId}`);
  return result;
}

export async function addCommentAction(storyId: string, text: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  
  const comment = await commentsData.addComment(storyId, userId, text);
  revalidatePath(`/story/${storyId}`);
  return comment;
}

export async function deleteCommentAction(commentId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  
  await commentsData.deleteComment(commentId, userId);
  // revalidatePath will be called with storyId from component
  return { success: true };
}
```

**Ventajas:**
- Type-safe end-to-end
- Auto-refresh con `revalidatePath()`
- No necesitas API routes
- Progressive enhancement (funciona sin JS)

---

### FASE 3: MIGRAR PÁGINAS (90 min)

#### ✅ Step 3: Migrar /stories/mine a RSC

**Estado actual:** Client Component con hooks complejos

**Nuevo enfoque:** Server Component + Client Component para interactividad

**Archivos a modificar/crear:**
1. `src/app/stories/mine/page.tsx` - Convertir a Server Component
2. `src/app/stories/mine/MyStoriesClient.tsx` - Nuevo client component

**Implementación:**

```typescript
// src/app/stories/mine/page.tsx (Server Component)
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getMyStories } from '@/lib/data/stories';
import MyStoriesClient from './MyStoriesClient';
import Navbar from '@/components/Navbar';
import EditorLayout from '@/components/Editor/EditorLayout';

export default async function MyStoriesPage({
  searchParams,
}: {
  searchParams: { page?: string; limit?: string };
}) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in?redirect=/stories/mine');
  }
  
  const page = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '10');
  const skip = (page - 1) * limit;
  
  const { stories, total } = await getMyStories(userId, { skip, limit });
  
  return (
    <EditorLayout>
      <Navbar />
      <MyStoriesClient
        initialStories={stories}
        total={total}
        page={page}
        limit={limit}
      />
    </EditorLayout>
  );
}
```

```typescript
// src/app/stories/mine/MyStoriesClient.tsx (Client Component)
'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { deleteStoryAction, deleteAllStoriesAction } from '@/app/actions';
import StoriesShell from '@/components/Stories/StoriesShell';
import StoriesContent from '@/components/Stories/StoriesContent';
import type { Story } from '@/types/story';

interface Props {
  initialStories: Story[];
  total: number;
  page: number;
  limit: number;
}

export default function MyStoriesClient({
  initialStories,
  total,
  page,
  limit,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;
    
    startTransition(async () => {
      try {
        await deleteStoryAction(id);
        router.refresh(); // Re-fetch server component
      } catch (error) {
        alert('Failed to delete story');
      }
    });
  };
  
  const handleDeleteAll = async () => {
    if (!confirm('Delete ALL your stories? This cannot be undone.')) return;
    
    startTransition(async () => {
      try {
        await deleteAllStoriesAction();
        router.refresh();
      } catch (error) {
        alert('Failed to delete stories');
      }
    });
  };
  
  const handlePageChange = (newPage: number) => {
    router.push(`/stories/mine?page=${newPage}&limit=${limit}`);
  };
  
  const handlePageSizeChange = (newLimit: number) => {
    router.push(`/stories/mine?page=1&limit=${newLimit}`);
  };
  
  return (
    <StoriesShell
      title="My Stories"
      // ... resto de props
    >
      <StoriesContent
        loading={isPending}
        stories={initialStories}
        onDelete={handleDelete}
        total={total}
        page={page}
        pageSize={limit}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        // ... resto de props
      />
    </StoriesShell>
  );
}
```

**Archivos a eliminar:**
- ❌ `src/hooks/useMyStories.ts`
- ❌ `src/hooks/useMyStoriesPaged.ts`
- ❌ `src/app/api/stories/mine/route.ts`

---

#### ✅ Step 4: Migrar /stories (explore) a RSC

Similar a `/stories/mine` pero público (no requiere auth).

**Implementación:**

```typescript
// src/app/stories/page.tsx (Server Component)
import { getStories } from '@/lib/data/stories';
import StoriesExploreClient from './StoriesExploreClient';
import Navbar from '@/components/Navbar';

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: { page?: string; limit?: string; q?: string };
}) {
  const page = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '10');
  const q = searchParams.q || '';
  const skip = (page - 1) * limit;
  
  const { stories, total } = await getStories({ skip, limit, q });
  
  return (
    <div className="h-screen flex flex-col bg-white">
      <Navbar />
      <StoriesExploreClient
        initialStories={stories}
        total={total}
        page={page}
        limit={limit}
        initialSearch={q}
      />
    </div>
  );
}
```

```typescript
// src/app/stories/StoriesExploreClient.tsx (Client Component)
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteStoryAction } from '@/app/actions';
// ... imports

export default function StoriesExploreClient({ ... }) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();
  
  const handleSearch = () => {
    router.push(`/stories?page=1&limit=${limit}&q=${search}`);
  };
  
  // ... resto de handlers
  
  return <StoriesContent ... />;
}
```

**Archivos a eliminar:**
- ❌ `src/hooks/useBufferedPagedStories.ts` (¡200 líneas!)
- ❌ `src/app/api/stories/route.ts`

---

#### ✅ Step 5: Migrar / (home) a RSC

**Estado actual:** Usa `HomeAuth` client component con `clerk.load()`

**Nuevo enfoque:** Server Component con `auth()` directo

```typescript
// src/app/page.tsx (Server Component)
import { auth } from '@clerk/nextjs/server';
import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';
import HomeGuest from '@/components/HomeGuest';

export default async function Home() {
  const { userId } = await auth();
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      {userId ? <Dashboard /> : <HomeGuest />}
    </div>
  );
}
```

```typescript
// src/components/HomeGuest.tsx (nuevo, simple)
import Link from 'next/link';

export default function HomeGuest() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center text-center p-8 text-black">
      <h2 className="text-4xl font-bold mb-4">
        Write and Share Your Stories
      </h2>
      <p className="text-lg mb-8">
        Join our community of writers and readers.
      </p>
      <div className="space-x-4">
        <Link
          href="/sign-in"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Sign Up
        </Link>
      </div>
    </main>
  );
}
```

**Archivos a eliminar:**
- ❌ `src/components/HomeAuth.tsx` (client-side auth check)

---

### FASE 4: LIMPIEZA (45 min)

#### ✅ Step 6: Eliminar API routes innecesarias

**Archivos a eliminar:**
```
❌ src/app/api/stories/route.ts
❌ src/app/api/stories/mine/route.ts
❌ src/app/api/stories/[id]/route.ts (evaluar si se usa externamente)
```

**Mantener:**
```
✅ src/app/api/webhooks/* (necesarios para Clerk)
```

**Verificar:**
- Buscar referencias a estos endpoints en el código
- Asegurar que todas las llamadas ahora usan Server Actions o `lib/data`

---

#### ✅ Step 7: Eliminar hooks obsoletos

**Archivos a eliminar:**
```
❌ src/hooks/useMyStories.ts            (-80 líneas)
❌ src/hooks/useMyStoriesPaged.ts       (-70 líneas)
❌ src/hooks/useBufferedPagedStories.ts (-200 líneas)
❌ src/hooks/useStories.ts              (si existe)
❌ src/hooks/useChapters.ts             (si existe)
```

**Tests a eliminar:**
```
❌ __tests__/unit/hooks/useMyStories.test.tsx
❌ __tests__/unit/hooks/useMyStoriesPaged.test.tsx
❌ __tests__/unit/hooks/useBufferedPagedStories.test.tsx
```

**Ahorro:** ~400 líneas de código complejo + ~200 líneas de tests

---

#### ✅ Step 8: Simplificar/Eliminar UserContext

**Decisión:** Eliminar completamente

**Razón:**
- Clerk ya provee `auth()` para Server Components
- Clerk ya provee `useUser()` para Client Components
- No necesitamos abstracción adicional

**Cambios:**

En **Server Components:**
```typescript
// Antes
const { userId } = useUser(); // ❌ No funciona en Server Components

// Después
import { auth } from '@clerk/nextjs/server';
const { userId } = await auth(); // ✅ Correcto
```

En **Client Components:**
```typescript
// Antes
import { useUser } from '@/contexts/UserContext';
const { userId, loading, isAuthor } = useUser();

// Después
import { useUser } from '@clerk/nextjs';
const { user, isLoaded } = useUser();
const userId = user?.id;

// Para isAuthor, usar helper simple
import { isAuthor } from '@/lib/utils/auth';
isAuthor(userId, story.authorId);
```

**Archivos a modificar:**
- Todos los componentes que usan `useUser()` del context
- `BravoButton.tsx`
- `StoryActions.tsx`
- `Comments.tsx`
- `ChapterViewer.tsx`
- etc.

**Archivos a eliminar:**
```
❌ src/contexts/UserContext.tsx
❌ __tests__/unit/contexts/UserContext.test.tsx
```

**Archivo a crear:**
```typescript
// src/lib/utils/auth.ts
export function isAuthor(
  userId: string | null | undefined,
  authorId: string | null | undefined
): boolean {
  return !!userId && !!authorId && userId === authorId;
}
```

**Modificar layout.tsx:**
```typescript
// Antes
<UserProvider>
  {children}
</UserProvider>

// Después
{children}
// Ya no necesitamos el wrapper
```

---

#### ✅ Step 9: Actualizar componentes para usar Server Actions

**Componentes a refactorizar:**

##### 1. BravoButton.tsx

```typescript
'use client';

import { useOptimistic, useTransition } from 'react';
import { useUser } from '@clerk/nextjs';
import { toggleBravoAction } from '@/app/actions';
import { isAuthor } from '@/lib/utils/auth';

interface Props {
  storyId: string;
  initialBravos: number;
  userBravos: string[];
  authorId: string;
}

export default function BravoButton({
  storyId,
  initialBravos,
  userBravos,
  authorId,
}: Props) {
  const { user, isLoaded } = useUser();
  const userId = user?.id;
  const [isPending, startTransition] = useTransition();
  
  const userHasBravo = userId ? userBravos.includes(userId) : false;
  const [optimisticBravos, addOptimisticBravo] = useOptimistic(
    { count: initialBravos, hasBravo: userHasBravo },
    (state) => ({
      count: state.hasBravo ? state.count - 1 : state.count + 1,
      hasBravo: !state.hasBravo,
    })
  );
  
  const handleBravo = () => {
    if (!userId) {
      alert('Please sign in to give bravo');
      return;
    }
    
    if (isAuthor(userId, authorId)) {
      alert('You cannot bravo your own story');
      return;
    }
    
    startTransition(async () => {
      addOptimisticBravo();
      await toggleBravoAction(storyId);
    });
  };
  
  return (
    <button
      onClick={handleBravo}
      disabled={isPending || !isLoaded}
      className="..."
    >
      {optimisticBravos.hasBravo ? '❤️' : '🤍'} {optimisticBravos.count}
    </button>
  );
}
```

##### 2. Comments.tsx

```typescript
'use client';

import { useOptimistic, useTransition, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { addCommentAction, deleteCommentAction } from '@/app/actions';

export default function Comments({ storyId, initialComments }) {
  const { user } = useUser();
  const [text, setText] = useState('');
  const [isPending, startTransition] = useTransition();
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    initialComments,
    (state, newComment: Comment) => [...state, newComment]
  );
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !text.trim()) return;
    
    startTransition(async () => {
      // Optimistic update
      addOptimisticComment({
        _id: 'temp-' + Date.now(),
        text,
        userId: user.id,
        storyId,
        createdAt: new Date().toISOString(),
      });
      
      setText('');
      await addCommentAction(storyId, text);
    });
  };
  
  // ... resto del componente
}
```

##### 3. StoryCard.tsx

```typescript
'use client';

import { useTransition } from 'react';
import { deleteStoryAction } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function StoryCard({ story, allowDelete }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const handleDelete = () => {
    if (!confirm('Delete this story?')) return;
    
    startTransition(async () => {
      await deleteStoryAction(story._id);
      router.refresh();
    });
  };
  
  return (
    <div className="...">
      {/* ... */}
      {allowDelete && (
        <button onClick={handleDelete} disabled={isPending}>
          {isPending ? 'Deleting...' : 'Delete'}
        </button>
      )}
    </div>
  );
}
```

**Ventajas de useOptimistic + useTransition:**
- UI instantánea (no espera al servidor)
- Automáticamente revierte si hay error
- Muestra pending state
- Mejor UX que loading spinners

---

### FASE 5: TESTING & DEPLOYMENT (30 min)

#### ✅ Step 10: Actualizar tests

**Tests a eliminar:**
```
❌ __tests__/unit/hooks/useMyStories.test.tsx
❌ __tests__/unit/hooks/useMyStoriesPaged.test.tsx
❌ __tests__/unit/hooks/useBufferedPagedStories.test.tsx
❌ __tests__/unit/contexts/UserContext.test.tsx
```

**Tests a crear:**

1. **Tests para lib/data functions:**
```typescript
// __tests__/unit/lib/data/stories.test.ts
import { getStories, getMyStories, deleteStory } from '@/lib/data/stories';

describe('stories data layer', () => {
  it('should fetch stories with pagination', async () => {
    const result = await getStories({ skip: 0, limit: 10 });
    expect(result.stories).toBeInstanceOf(Array);
    expect(typeof result.total).toBe('number');
  });
  
  // ... más tests
});
```

2. **Tests para Server Actions:**
```typescript
// __tests__/unit/app/actions.test.ts
import { deleteStoryAction } from '@/app/actions';

// Mock auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => ({ userId: 'test-user-id' })),
}));

describe('Server Actions', () => {
  it('should delete story if authorized', async () => {
    const result = await deleteStoryAction('story-123');
    expect(result.success).toBe(true);
  });
  
  // ... más tests
});
```

3. **Tests para componentes con Server Actions:**
```typescript
// __tests__/unit/components/BravoButton.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import BravoButton from '@/components/BravoButton';

// Mock Server Action
jest.mock('@/app/actions', () => ({
  toggleBravoAction: jest.fn(),
}));

describe('BravoButton', () => {
  it('should show optimistic update', async () => {
    render(<BravoButton storyId="123" initialBravos={5} ... />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Should update immediately (optimistic)
    expect(screen.getByText(/6/)).toBeInTheDocument();
  });
});
```

**Actualizar jest.config.ts si es necesario:**
```typescript
// Para soportar Server Actions en tests
export default {
  // ...
  testEnvironment: 'node', // Para Server Components
  // O usar @testing-library/react con next/experimental
};
```

---

#### ✅ Step 11: Verificar build y deployment

**Checklist de verificación:**

1. **Build exitoso:**
```bash
pnpm build
# Verificar que no hay errores de TypeScript
# Verificar que no hay errores de Next.js
```

2. **Test suite completo:**
```bash
pnpm test --watchAll=false
# Todos los tests deben pasar
```

3. **Verificación manual en dev:**
```bash
pnpm dev
```

Probar:
- ✅ Home page (autenticado y no autenticado)
- ✅ `/stories` - Explorar stories
  - Búsqueda
  - Paginación
  - Ver story
- ✅ `/stories/mine` - Mis stories
  - Lista de stories
  - Crear story
  - Editar story
  - Eliminar story
  - Delete all
- ✅ `/story/[id]` - Ver story
  - Bravo button
  - Comentarios
  - Navegación entre capítulos
- ✅ Auth flows
  - Sign in
  - Sign up
  - Sign out

4. **Verificación en production mode:**
```bash
pnpm build
pnpm start
# Probar las mismas funcionalidades
```

5. **Performance check:**
- Lighthouse score
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Compare con versión anterior

6. **Verificar logs:**
- No errors en consola
- No warnings de Next.js
- Cache funcionando correctamente

---

## 📝 NOTAS IMPORTANTES

### Consideraciones de Cache

Next.js cachea Server Components por defecto. Para invalidar:

```typescript
// En Server Actions
import { revalidatePath } from 'next/cache';

revalidatePath('/stories/mine');      // Invalida página específica
revalidatePath('/stories', 'page');   // Invalida solo esa página
revalidatePath('/stories', 'layout'); // Invalida layout y todas las sub-páginas
```

### Dynamic vs Static Rendering

```typescript
// Forzar dynamic rendering si es necesario
export const dynamic = 'force-dynamic';

// O solo revalidar cada X segundos
export const revalidate = 60; // 60 segundos
```

### Streaming con Suspense

Para mejor UX, considera usar Suspense:

```typescript
import { Suspense } from 'react';

export default async function Page() {
  return (
    <div>
      <Suspense fallback={<Loading />}>
        <Stories />
      </Suspense>
    </div>
  );
}
```

### Error Handling

```typescript
// error.tsx para manejar errores
'use client';

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// loading.tsx para loading states
export default function Loading() {
  return <Skeleton />;
}
```

---

## 🎯 CHECKLIST DE PROGRESO

### Fase 1: Preparación
- [ ] Crear `src/lib/data/stories.ts`
- [ ] Crear `src/lib/data/chapters.ts`
- [ ] Crear `src/lib/data/comments.ts`
- [ ] Crear `src/lib/data/types.ts`

### Fase 2: Server Actions
- [ ] Crear `src/app/actions.ts` con todas las actions
- [ ] Testear actions básicas

### Fase 3: Migración de Páginas
- [ ] Migrar `/stories/mine` a RSC
- [ ] Crear `MyStoriesClient.tsx`
- [ ] Migrar `/stories` a RSC
- [ ] Crear `StoriesExploreClient.tsx`
- [ ] Migrar `/` (home) a RSC
- [ ] Crear `HomeGuest.tsx`

### Fase 4: Limpieza
- [ ] Eliminar API routes obsoletas
- [ ] Eliminar hooks obsoletos
- [ ] Eliminar UserContext
- [ ] Actualizar `BravoButton.tsx`
- [ ] Actualizar `Comments.tsx`
- [ ] Actualizar `StoryCard.tsx`
- [ ] Actualizar otros componentes según sea necesario

### Fase 5: Testing
- [ ] Crear tests para `lib/data`
- [ ] Crear tests para Server Actions
- [ ] Actualizar tests de componentes
- [ ] Eliminar tests obsoletos
- [ ] Ejecutar test suite completo

### Fase 6: Verificación
- [ ] Build exitoso
- [ ] Tests pasando
- [ ] Verificación manual en dev
- [ ] Verificación en production mode
- [ ] Performance check
- [ ] Deploy a staging/production

---

## 📊 MÉTRICAS DE ÉXITO

**Antes:**
- ~800 líneas de código complejo
- Race conditions en fetching
- Multiple loading states
- Client-side rendering delays
- Complejidad de debugging

**Después:**
- ~700 líneas de código simple
- Sin race conditions
- SSR instantáneo
- Mejor SEO
- Código mantenible

**Mediciones:**
- [ ] Lighthouse score mejorado
- [ ] TTFB reducido
- [ ] FCP reducido
- [ ] Bundle size reducido
- [ ] Complejidad ciclomática reducida

---

## 🔄 ROLLBACK PLAN

Si algo sale mal:

```bash
# Revertir todos los cambios
git checkout main
git branch -D refactor/avoid-duplicates-n-use-context

# O revertir archivo por archivo
git checkout HEAD -- src/app/stories/mine/page.tsx
```

**Backup:** Mantener rama actual como respaldo hasta confirmar que todo funciona en producción.

---

## 📚 RECURSOS

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/reference/react/use-server)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Clerk + Next.js App Router](https://clerk.com/docs/quickstarts/nextjs)
- [useOptimistic Hook](https://react.dev/reference/react/useOptimistic)
- [useTransition Hook](https://react.dev/reference/react/useTransition)

---

**Última actualización:** 5 de octubre, 2025  
**Estado:** Plan completo, listo para ejecución
