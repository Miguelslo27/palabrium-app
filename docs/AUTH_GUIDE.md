# Guía de Autenticación y Autorización

> Última actualización: octubre 2025  
> Estado: Migración a React Server Components completa

Esta guía describe cómo manejar autenticación y autorización ahora que la app funciona con React Server Components (RSC) + Clerk, sin `UserContext` personalizado.

---

## 1. Autenticación en Server Components

Usa siempre las utilidades del SDK server-side:

```typescript
import { auth, currentUser } from '@clerk/nextjs/server';

export default async function StoriesPage() {
  const { userId } = await auth();      // ID del usuario o null
  const user = await currentUser();     // Perfil completo o null

  if (!userId) {
    // Redirigir o renderizar vista pública
  }

  // … lógica del componente
}
```

- `auth()` es ideal para gating rápido (¿hay usuario?).  
- `currentUser()` solo cuando necesitas datos de perfil; evita llamarlo si no es necesario.  
- Si la página requiere login, redirige con Clerk:

```typescript
import { redirect } from 'next/navigation';

const { userId } = await auth();
if (!userId) redirect('/sign-in?redirect=/stories/mine');
```

---

## 2. Autenticación en Server Actions

Todas las mutations residen en `src/app/actions.ts`. Sigue este patrón:

```typescript
'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import * as storiesData from '@/lib/data/stories';

export async function createStoryAction(input: { title: string; description?: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const story = await storiesData.createStory(input, userId);
  revalidatePath('/stories/mine');
  return story;
}
```

Recomendaciones:
- Valida `userId` al inicio.
- Reutiliza la capa de datos en `src/lib/data/*`.
- Usa `revalidatePath` para refrescar vistas relevantes.

---

## 3. Autenticación en Client Components

Para interacciones en cliente utiliza los hooks de Clerk:

```typescript
'use client';

import { useUser, useAuth } from '@clerk/nextjs';

export default function Navbar() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();

  if (!isLoaded) return null;

  return user ? (
    <button onClick={() => signOut({ redirectUrl: '/' })}>Salir</button>
  ) : (
    <Link href="/sign-in">Ingresar</Link>
  );
}
```

Notas:
- `useUser()` expone `user`, `isLoaded`, `isSignedIn`.
- `useAuth()` ofrece helpers (`signOut`, `getToken`, etc).
- Ya no existe `UserProvider` ni `getClientUserId`; evita recrearlos.

---

## 4. Compartiendo información con Client Components

Cuando un Server Component necesita pasar datos de usuario a un Client Component:

```tsx
// Server Component
const { userId } = await auth();
return <StoryActions storyId={story._id} userId={userId} />;
```

El Client Component recibe los props y decide qué mostrar sin hacer fetch adicional.

---

## 5. Autorización

Centraliza las decisiones de permisos en el server:
- Las Server Actions validan autoría usando la capa de datos (`storiesData`, `chaptersData`, etc).
- Los Server Components evitan renderizar formularios si el usuario no es el autor.
- Los Client Components solo reciben flags (`canEdit`, `isAuthor`) calculados en el servidor.

Ejemplo en `story/[id]/edit/page.tsx`:
```typescript
const story = await getStory(id);
if (!story || story.authorId !== userId) redirect('/stories/mine');
```

---

## 6. Testing

### 6.1 Tests de Server Actions
- Mockea `@clerk/nextjs/server` para controlar `auth()`.
- Reemplaza las funciones de la capa de datos con `jest.mock`.

### 6.2 Tests de Client Components
- Usa `__tests__/mocks/actions.ts` para stubear Server Actions.
- Mockea `@clerk/nextjs` (`useUser`, `useAuth`) según cada escenario.

Ejemplo de mock global:
```typescript
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({ isLoaded: true, isSignedIn: true, user: { id: 'user-1' } }),
  useAuth: () => ({ signOut: jest.fn() }),
}));
```

---

## 7. Limpieza de código legacy

Historial (referencia histórica del refactor anterior):
- `src/contexts/UserContext.tsx`
- `getClientUserId()` en componentes cliente
- Hooks personalizados (`useStories`, `useChapters`, etc.) que hacían fetch contra `/api/*`
- Tests dedicados a estos patrones

Estado actual:
- **Server Actions** centralizan todas las mutations (`src/app/actions.ts`).
- **Capa de datos** en `src/lib/data/*` expone lectura/escritura directamente contra MongoDB.
- **Autenticación en cliente** depende exclusivamente de los hooks oficiales de Clerk (`useUser`, `useAuth`).
- **Testing** utiliza `__tests__/mocks/actions.ts` y mocks de `@clerk/nextjs`.

Si encuentras referencias al enfoque anterior, elimina el código legacy y sigue las pautas descritas en los apartados 1–6 de esta guía.

---

## 8. Checklist rápido

- [x] Server Components usan `auth()` / `currentUser()`
- [x] Client Components usan `useUser()` / `useAuth()`
- [x] Mutations → Server Actions + capa de datos
- [x] No quedan fetches a rutas internas para CRUD de historias/capítulos
- [x] Tests mockean Clerk directamente

---

## 9. Recursos adicionales

- [Documentación oficial de Clerk para Next.js](https://clerk.com/docs/nextjs)
- [Migración a RSC (`RSC_MIGRATION_PLAN.md`)](../RSC_MIGRATION_PLAN.md)
- [Resumen de refactorización actual (`REFACTORING_SUMMARY.md`)](../REFACTORING_SUMMARY.md)

Si necesitas agregar un nuevo flujo de autenticación (OAuth adicional, roles, invitaciones), alinéalo con Clerk y documenta el cambio en esta guía.
