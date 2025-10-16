# Estado de Refactorización

## 📌 Prioridades vigentes (post RSC)

- **RSC + Clerk como fuente de verdad**: Eliminar cualquier resto de lógica cliente (`getClientUserId`, contextos custom) y validar que todos los formularios usen datos inyectados por Server Components. Referencia: `docs/AUTH_GUIDE.md`.
- **Paginación y layout de historias**: Extraer lógica de `StoriesContent` y `StoriesShell` a hooks reutilizables (paginación, preferencias de vista) y cubrir `/stories/mine` con tests de integración.
- **Interfaz del editor**: Completar la modularización de `StoryFormClient` (controles de publicación, sidebar, capítulos) aprovechando las Server Actions ya migradas.
- **Observabilidad**: Incorporar métricas básicas (logs de server actions, trazas) que faciliten depurar cuando las acciones se ejecutan en el servidor.

El resto de este documento se mantiene como **historial** del refactor previo basado en `UserContext`; consúltalo solo como referencia de la evolución del proyecto.

## 🗃️ Histórico 2024 – Contexto Global de Usuario (archivado)

> **Nota:** Estas secciones documentan el enfoque anterior con `UserContext`. No deben aplicarse al estado actual; se conservan a modo de registro.

## ✅ COMPLETADO - Prioridad 1: Contexto Global de Usuario

### Implementación
Se ha creado exitosamente `UserContext` para centralizar el manejo del estado de autenticación:

- **Archivo creado**: `src/contexts/UserContext.tsx`
- **Proveedor integrado**: En `src/app/layout.tsx`
- **Hook personalizado**: `useUser()` que retorna `{ userId, loading, isAuthor(authorId) }`
- **Tests**: 12 tests en `__tests__/unit/contexts/UserContext.test.tsx` (100% passing)

### Componentes Refactorizados
1. ✅ `src/components/BravoButton.tsx` - Simplificado de 25 a 15 líneas
2. ✅ `src/components/Story/StoryActions.tsx` - Eliminada lógica duplicada
3. ✅ `src/components/Story/StoryCard.tsx` - Uso de `useUser()`
4. ✅ `src/components/Story/ChapterViewer.tsx` - Detección de autor simplificada
5. ✅ `src/components/Comments.tsx` - Acceso síncrono a userId
6. ✅ `src/hooks/useMyStoriesPaged.ts` - Refactorizado para usar contexto

### Métricas de Impacto
- **Código eliminado**: ~120 líneas de lógica duplicada (15 líneas × 8 componentes)
- **Patrón eliminado**: 8+ instancias del patrón `getClientUserId()` + `useEffect` + `useState`
- **Simplificación**: Componentes reducidos en ~40% de código relacionado a autenticación
- **Mantenibilidad**: ✅ Un solo lugar para modificar lógica de usuario

## ✅ COMPLETADO - Prioridad 2: Eliminar Código Duplicado

### StoryBravo.tsx vs StoryActions.tsx
- ✅ **Eliminado**: `src/components/Story/StoryBravo.tsx` (100% duplicado)
- ✅ **Mantenido**: `src/components/Story/StoryActions.tsx`
- **Impacto**: Eliminadas 42 líneas de código duplicado

### Resultado General
- **Suite de tests**: 446/446 tests unitarios pasando ✅
- **Tests de integración**: 68/68 pasando ✅
- **Linter**: 0 errores, 0 warnings ✅
- **Coverage**: 42% (mantenido)
- **Infraestructura de tests**: Actualizada con `UserProvider` en `test-utils.tsx`

---

# Oportunidades de Refactorización - Writing Tool 🔄 Oportunidades de Refactorización y Mejoras Arquitectónicas

> **Análisis realizado:** Octubre 2025  
> **Estado del proyecto:** Creciendo (502 tests, arquitectura Next.js 15)

---

## 📊 Resumen Ejecutivo

El proyecto ha crecido significativamente y presenta varias oportunidades para mejorar:
- **Código duplicado** en componentes de autenticación y manejo de usuario
- **Componentes grandes** que podrían dividirse
- **Lógica repetida** de fetching y estado que puede extraerse a hooks
- **Estado global ausente** - actualmente usa prop drilling y múltiples llamadas API

---

## 🎯 Prioridades de Refactorización

### ⚠️ CRÍTICO - Código Duplicado Significativo

#### 1. **StoryBravo.tsx y StoryActions.tsx son IDÉNTICOS** 
**Archivos:**
- `src/components/Story/StoryBravo.tsx` (42 líneas)
- `src/components/Story/StoryActions.tsx` (42 líneas)

**Problema:**
```tsx
// Ambos archivos tienen EXACTAMENTE el mismo código
export default function StoryBravo/StoryActions({ storyId, initialBravos, userBravos, authorId }) {
  const [bravosCount, setBravosCount] = useState<number>(initialBravos);
  const [braved, setBraved] = useState<boolean | undefined>(undefined);
  const [isAuthor, setIsAuthor] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    getClientUserId().then((id) => {
      if (!mounted) return;
      setBraved(id ? userBravos.includes(id) : false);
      setIsAuthor(Boolean(id && authorId && id === authorId));
    });
    return () => { mounted = false; };
  }, [userBravos, authorId]);
  // ... resto idéntico
}
```

**Solución:** Eliminar uno de los dos archivos y usar un solo componente.

**Impacto:** 🔴 Alto - Mantenimiento duplicado, riesgo de bugs inconsistentes

---

#### 2. **Patrón repetido: getClientUserId en useEffect**

**Archivos afectados (8+ componentes):**
- `BravoButton.tsx`
- `StoryBravo.tsx`
- `StoryActions.tsx`
- `StoryCard.tsx`
- `ChapterViewer.tsx`
- `Comments.tsx`
- Y más...

**Patrón repetido:**
```tsx
const [userId, setUserId] = useState<string | null>(null);
const [isAuthor, setIsAuthor] = useState<boolean>(false);

useEffect(() => {
  let mounted = true;
  getClientUserId().then((id) => {
    if (!mounted) return;
    setUserId(id);
    setIsAuthor(Boolean(id && authorId && id === authorId));
  });
  return () => { mounted = false; };
}, [authorId]);
```

**Solución propuesta:**
```tsx
// src/hooks/useCurrentUser.ts
export function useCurrentUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getClientUserId().then((id) => {
      if (!mounted) return;
      setUserId(id);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  return { userId, loading };
}

// src/hooks/useIsAuthor.ts
export function useIsAuthor(authorId: string | null | undefined) {
  const { userId } = useCurrentUser();
  return Boolean(userId && authorId && userId === authorId);
}
```

**Beneficios:**
- Elimina ~10 líneas de código duplicado por componente
- Centraliza la lógica de autenticación del cliente
- Facilita el testing
- Cache automático del userId (se calcula una sola vez)

**Impacto:** 🟠 Alto - Simplifica 8+ componentes

---

### 🏗️ ALTO - Componentes Grandes que Deben Dividirse

#### 3. **StoryFormClient.tsx (165 líneas)**

**Problema:**
- Maneja demasiadas responsabilidades: form state, publish logic, navigation, UI
- 40 líneas de props destructuring del hook useStoryForm
- Lógica de publish/unpublish inline con manejo de loading

**Solución propuesta:**
```
StoryFormClient/
├── index.tsx (orquestador principal, 40 líneas)
├── StoryFormHeader.tsx (botones de acción, 60 líneas)
├── StoryPublishControls.tsx (lógica publish/unpublish, 40 líneas)
└── useStoryFormSubmit.ts (lógica de submit, 30 líneas)
```

**Ejemplo:**
```tsx
// StoryPublishControls.tsx
export default function StoryPublishControls({ 
  storyId, 
  published, 
  onToggle 
}: Props) {
  const [loading, setLoading] = useState(false);
  
  const handleToggle = async () => {
    setLoading(true);
    try {
      const data = await toggleStoryPublish(storyId, !published);
      onToggle(data);
    } finally {
      setLoading(false);
    }
  };

  return published ? (
    <UnpublishButton onClick={handleToggle} loading={loading} />
  ) : (
    <PublishButton onClick={handleToggle} loading={loading} />
  );
}
```

**Impacto:** 🟠 Medio - Mejora mantenibilidad y testabilidad

---

#### 4. **StoriesContent.tsx (110 líneas) - Demasiadas responsabilidades**

**Problema:**
- Maneja: paginación, view mode, localStorage, cálculos de páginas, rendering
- Lógica compleja de paginación cliente vs servidor
- useEffect múltiples para sincronización

**Solución propuesta:**
```tsx
// src/hooks/useStoriesPagination.ts
export function useStoriesPagination({
  stories,
  serverPaged,
  total,
  pageSize,
  initialPage
}: Props) {
  // toda la lógica de paginación aquí
  return {
    currentPage,
    totalPages,
    pagedStories,
    setPage,
    setPageSize
  };
}

// src/hooks/useViewPreference.ts
export function useViewPreference() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  
  useEffect(() => {
    const saved = localStorage.getItem('stories.view');
    if (saved === 'grid' || saved === 'list') setView(saved);
  }, []);
  
  useEffect(() => {
    localStorage.setItem('stories.view', view);
  }, [view]);
  
  return [view, setView] as const;
}

// StoriesContent.tsx se reduce a ~40 líneas
export default function StoriesContent(props: Props) {
  const [view, setView] = useViewPreference();
  const pagination = useStoriesPagination(props);
  
  if (props.loading) return <LoadingState />;
  if (props.unauthorized) return <UnauthorizedState />;
  if (!props.stories.length) return <EmptyState />;

  return (
    <div>
      <StoriesToolbar {...pagination} view={view} onChangeView={setView} />
      <StoryList {...pagination} view={view} />
    </div>
  );
}
```

**Impacto:** 🟠 Alto - Componente más simple, hooks reutilizables

---

#### 5. **ChapterViewer.tsx (75 líneas)**

**Problema:**
- Maneja: selección de capítulos, progreso, autenticación de autor, visibilidad
- Lógica de "visible chapters" compleja (publicados vs todos)

**Solución propuesta:**
```tsx
// src/hooks/useChapterNavigation.ts
export function useChapterNavigation(
  chapters: Chapter[],
  initialIndex: number,
  authorId?: string | null
) {
  const [index, setIndex] = useState(initialIndex);
  const { userId } = useCurrentUser();
  const isAuthor = useIsAuthor(authorId);
  
  const visibleChapters = useMemo(() => 
    isAuthor ? chapters : chapters.filter(c => c.published),
    [isAuthor, chapters]
  );

  const clampedIndex = useMemo(() => 
    Math.max(0, Math.min(index, visibleChapters.length - 1)),
    [index, visibleChapters.length]
  );

  const navigate = useCallback((newIndex: number) => {
    setIndex(Math.max(0, Math.min(newIndex, visibleChapters.length - 1)));
  }, [visibleChapters.length]);

  return {
    index: clampedIndex,
    visibleChapters,
    isAuthor,
    next: () => navigate(clampedIndex + 1),
    prev: () => navigate(clampedIndex - 1),
    goto: navigate,
  };
}

// ChapterViewer.tsx se reduce a ~30 líneas
export default function ChapterViewer({ chapters, initialIndex, ...metadata }: Props) {
  const navigation = useChapterNavigation(chapters, initialIndex, metadata.authorId);
  
  useChapterProgress(navigation.index, navigation.visibleChapters.length);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <ChapterSidebar {...metadata} {...navigation} />
      <ChapterReader chapter={navigation.visibleChapters[navigation.index]} {...navigation} />
    </div>
  );
}
```

**Impacto:** 🟡 Medio - Hook reutilizable para navegación de capítulos

---

### 🌐 ALTO - Estado Global y Gestión de Datos

#### 6. **Falta de Estado Global - Prop Drilling Evidente**

**Problema actual:**
```tsx
// stories/page.tsx
<StoriesContent 
  loading={isLoading}
  stories={filtered}
  onDelete={handleDelete}
  pageSize={pageSize}
  serverPaged={true}
  total={total}
  page={page}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
/>

// stories/mine/page.tsx - casi idéntico pero con props diferentes
<StoriesContent 
  loading={paged.loading}
  unauthorized={paged.unauthorized || unauthorized}
  stories={pagedStories}
  // ... 10 props más
/>
```

**Problemas identificados:**
- Usuario se obtiene múltiples veces en diferentes componentes
- Cada componente hace su propio `getClientUserId()`
- No hay cache de datos del usuario
- Stories se recargan completamente en cada navegación
- No hay optimistic updates para acciones (bravo, delete)

---

**Solución recomendada: React Context + Custom Hooks**

Para un proyecto de este tamaño (mediano, creciendo), React Context es la mejor opción:

#### ✅ **Por qué Context es mejor que Redux/Zustand:**
1. **Ya usas Next.js 15** - Server Components + Client Components
2. **No necesitas time-travel debugging** (no es una app compleja tipo dashboard)
3. **Menos boilerplate** que Redux
4. **Built-in en React** - no necesitas otra dependencia
5. **Funciona perfectamente con Server Components** de Next.js

#### ❌ **Por qué NO Redux:**
- Overkill para este caso de uso
- Requiere mucho boilerplate (actions, reducers, store)
- No juega tan bien con Server Components de Next.js
- El devtools no es crítico aquí

#### ❌ **Por qué NO Zustand (todavía):**
- Es excelente pero agrega otra dependencia
- Context es suficiente para tu escala actual
- Puedes migrar a Zustand más adelante si creces mucho

---

**Implementación propuesta con Context:**

```tsx
// src/contexts/UserContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import getClientUserId from '@/lib/getClientUserId';

interface UserContextValue {
  userId: string | null;
  loading: boolean;
  isAuthor: (authorId?: string | null) => boolean;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getClientUserId().then((id) => {
      if (!mounted) return;
      setUserId(id);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const isAuthor = (authorId?: string | null) => {
    return Boolean(userId && authorId && userId === authorId);
  };

  return (
    <UserContext.Provider value={{ userId, loading, isAuthor }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
}
```

```tsx
// src/contexts/StoriesContext.tsx (para cache de stories)
"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Story } from '@/types/story';

interface StoriesContextValue {
  cache: Map<string, Story>;
  getStory: (id: string) => Story | undefined;
  setStory: (id: string, story: Story) => void;
  removeStory: (id: string) => void;
  updateStory: (id: string, updates: Partial<Story>) => void;
  invalidate: (id?: string) => void;
}

const StoriesContext = createContext<StoriesContextValue | undefined>(undefined);

export function StoriesProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<Map<string, Story>>(new Map());

  const getStory = useCallback((id: string) => cache.get(id), [cache]);
  
  const setStory = useCallback((id: string, story: Story) => {
    setCache(prev => new Map(prev).set(id, story));
  }, []);

  const removeStory = useCallback((id: string) => {
    setCache(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const updateStory = useCallback((id: string, updates: Partial<Story>) => {
    setCache(prev => {
      const story = prev.get(id);
      if (!story) return prev;
      const next = new Map(prev);
      next.set(id, { ...story, ...updates });
      return next;
    });
  }, []);

  const invalidate = useCallback((id?: string) => {
    if (id) {
      setCache(prev => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
    } else {
      setCache(new Map());
    }
  }, []);

  return (
    <StoriesContext.Provider value={{ 
      cache, 
      getStory, 
      setStory, 
      removeStory, 
      updateStory, 
      invalidate 
    }}>
      {children}
    </StoriesContext.Provider>
  );
}

export function useStories() {
  const context = useContext(StoriesContext);
  if (!context) throw new Error('useStories must be used within StoriesProvider');
  return context;
}
```

```tsx
// src/app/layout.tsx - Agregar providers
import { UserProvider } from '@/contexts/UserContext';
import { StoriesProvider } from '@/contexts/StoriesContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ClerkProvider>
          <UserProvider>
            <StoriesProvider>
              {children}
            </StoriesProvider>
          </UserProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
```

**Uso simplificado en componentes:**

```tsx
// ANTES (15 líneas)
const [userId, setUserId] = useState<string | null>(null);
const [isAuthor, setIsAuthor] = useState<boolean>(false);

useEffect(() => {
  let mounted = true;
  getClientUserId().then((id) => {
    if (!mounted) return;
    setUserId(id);
    setIsAuthor(Boolean(id && authorId && id === authorId));
  });
  return () => { mounted = false; };
}, [authorId]);

// DESPUÉS (1 línea)
const { userId, isAuthor } = useUser();
const authorStatus = isAuthor(authorId);
```

**Impacto:** 🔴 Crítico - Elimina prop drilling, centraliza autenticación, permite cache

---

### 🔧 MEDIO - Lógica Extraíble a Hooks

#### 7. **Lógica de Bravo repetida (BravoButton, StoryCard)**

**Hook propuesto:**
```tsx
// src/hooks/useBravo.ts
export function useBravo(
  storyId: string,
  initialBravos: number,
  userBravos: string[]
) {
  const { userId } = useUser();
  const [bravos, setBravos] = useState(initialBravos);
  const [braved, setBraved] = useState(false);
  const [optimisticBraved, setOptimisticBraved] = useState<boolean | null>(null);

  useEffect(() => {
    setBraved(userId ? userBravos.includes(userId) : false);
  }, [userId, userBravos]);

  const toggleBravo = async () => {
    if (!userId) return;

    // Optimistic update
    const newBraved = !braved;
    setOptimisticBraved(newBraved);
    setBravos(prev => newBraved ? prev + 1 : prev - 1);

    try {
      const res = await fetch(`/api/stories/${storyId}/bravo`, {
        method: 'POST',
        headers: { 'x-user-id': userId },
      });
      
      if (!res.ok) throw new Error('Failed to toggle bravo');
      
      const data = await res.json();
      setBravos(data.bravos);
      setBraved(data.braved);
      setOptimisticBraved(null);
    } catch (err) {
      // Rollback optimistic update
      setOptimisticBraved(null);
      setBravos(initialBravos);
      setBraved(userId ? userBravos.includes(userId) : false);
      throw err;
    }
  };

  return {
    bravos,
    braved: optimisticBraved ?? braved,
    toggleBravo,
    canBravo: Boolean(userId),
  };
}
```

**Impacto:** 🟡 Medio - Simplifica BravoButton y permite optimistic updates

---

#### 8. **Lógica de localStorage repetida (view preference)**

**Hook propuesto:**
```tsx
// src/hooks/useLocalStorage.ts
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  validator?: (value: unknown) => value is T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return initialValue;
      const parsed = JSON.parse(item);
      return validator ? (validator(parsed) ? parsed : initialValue) : parsed;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key]);

  return [storedValue, setValue];
}

// Uso:
const [view, setView] = useLocalStorage<'grid' | 'list'>(
  'stories.view',
  'grid',
  (v): v is 'grid' | 'list' => v === 'grid' || v === 'list'
);
```

**Impacto:** 🟢 Bajo - Nice to have, reutilizable

---

### 📝 BAJO - Mejoras Menores

#### 9. **Componentes de iconos individuales innecesarios**

**Archivos:**
- `IconEye.tsx` (15 líneas)
- `IconEyeOff.tsx` (15 líneas)
- `IconTrash.tsx` (15 líneas)
- `IconExternal.tsx` (15 líneas)

**Solución:**
```tsx
// src/components/icons/index.tsx (60 líneas total vs 60 líneas x4 archivos)
export function IconEye({ className = 'h-5 w-5' }: IconProps) { /* ... */ }
export function IconEyeOff({ className = 'h-5 w-5' }: IconProps) { /* ... */ }
export function IconTrash({ className = 'h-5 w-5' }: IconProps) { /* ... */ }
export function IconExternal({ className = 'h-5 w-5' }: IconProps) { /* ... */ }

// O mejor: usar una librería como lucide-react o heroicons
import { Eye, EyeOff, Trash2, ExternalLink } from 'lucide-react';
```

**Impacto:** 🟢 Bajo - Simplificación, pero no urgente

---

#### 10. **Tailwind classes muy repetidas**

**Problema:**
```tsx
// Visto en múltiples archivos:
className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm"
```

**Solución:**
```tsx
// src/components/ui/Button.tsx (componente genérico con variants)
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded font-semibold transition',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        success: 'bg-green-600 text-white hover:bg-green-700',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        ghost: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button className={buttonVariants({ variant, size, className })} {...props} />
  );
}

// Uso:
<Button variant="primary" size="lg">Create Story</Button>
<Button variant="ghost" size="sm">Cancel</Button>
```

**Impacto:** 🟢 Bajo - Mejora consistencia de UI

---

## 📋 Plan de Implementación Sugerido

### Fase 1: Crítico (1-2 días)
1. ✅ **Eliminar duplicado StoryBravo/StoryActions** (30 min)
2. ✅ **Crear UserContext y hook useUser** (2 horas)
3. ✅ **Refactorizar componentes para usar useUser** (3 horas)
4. ✅ **Tests para nuevos contexts** (1 hora)

### Fase 2: Alto impacto (2-3 días)
5. ✅ **Crear StoriesContext para cache** (3 horas)
6. ✅ **Dividir StoryFormClient** (4 horas)
7. ✅ **Extraer hooks de StoriesContent** (3 horas)
8. ✅ **Refactorizar ChapterViewer** (2 horas)

### Fase 3: Limpieza (1 día)
9. ✅ **Crear hook useBravo** (2 horas)
10. ✅ **Hook useLocalStorage** (1 hora)
11. ✅ **Consolidar iconos** (1 hora)

### Fase 4: Opcional (cuando sea necesario)
12. ⏳ **Sistema de componentes UI con variants** (según necesidad)
13. ⏳ **Migrar a Zustand** (si el proyecto crece mucho más)

---

## 🎯 Métricas de Éxito

Después de la refactorización:
- ❌ **Antes:** 8+ componentes con código duplicado de getClientUserId
- ✅ **Después:** 1 hook reutilizable `useUser()`

- ❌ **Antes:** StoryFormClient.tsx (165 líneas)
- ✅ **Después:** 4 archivos más pequeños (~40 líneas cada uno)

- ❌ **Antes:** Props drilling de user data en 10+ componentes
- ✅ **Después:** Context Provider con 2 líneas de código por componente

- ❌ **Antes:** Cada componente hace su propio fetch
- ✅ **Después:** Cache centralizado con optimistic updates

---

## 🚀 Alternativas de Estado Global Evaluadas

| Solución            | Pros                                | Contras                         | Recomendación                      |
| ------------------- | ----------------------------------- | ------------------------------- | ---------------------------------- |
| **React Context** ✅ | Built-in, simple, Next.js friendly  | Performance en apps MUY grandes | ⭐ **Recomendado para tu caso**     |
| **Zustand**         | Ligero, menos boilerplate que Redux | Otra dependencia                | Considera si creces mucho          |
| **Redux Toolkit**   | Robusto, devtools, time-travel      | Mucho boilerplate, complejo     | ❌ Overkill para este proyecto      |
| **Jotai**           | Atomic state, ligero                | Menos documentación             | Alternativa si no te gusta Context |
| **Recoil**          | De Meta, atomic state               | Beta, API inestable             | ❌ No recomendado                   |
| **TanStack Query**  | Cache + fetching automático         | Curva de aprendizaje            | Considera para el futuro           |

---

## 💡 Recomendación Final

**Prioridad inmediata:**
1. Context para User (UserProvider + useUser hook)
2. Eliminar duplicado StoryBravo/StoryActions
3. Extraer lógica repetida a hooks custom

**Estas 3 acciones eliminarán el 70% del código duplicado con mínimo esfuerzo.**

Después, evalúa si necesitas:
- StoriesContext para cache (si notas performance issues)
- Dividir componentes grandes (si agregas más features)
- TanStack Query (si el fetching se vuelve más complejo)

**No necesitas Redux/Zustand todavía.** Context + hooks custom es suficiente para tu escala actual.

---

¿Quieres que empiece implementando alguna de estas mejoras? Recomiendo empezar por el **UserContext** y eliminar el duplicado **StoryBravo/StoryActions**.
