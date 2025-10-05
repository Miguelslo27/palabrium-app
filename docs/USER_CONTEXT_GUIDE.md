# Guía de Uso: UserContext

## ¿Qué es UserContext?

`UserContext` es un contexto de React que proporciona acceso centralizado a la información de autenticación del usuario en toda la aplicación. Elimina la necesidad de llamar repetidamente a `getClientUserId()` en múltiples componentes.

## Uso Básico

### En Componentes

```typescript
import { useUser } from '@/contexts/UserContext';

function MyComponent() {
  const { userId, loading, isAuthor } = useUser();
  
  if (loading) {
    return <div>Cargando...</div>;
  }
  
  return (
    <div>
      {userId ? `Usuario: ${userId}` : 'No autenticado'}
    </div>
  );
}
```

### Verificar Autoría

```typescript
function StoryComponent({ story }: { story: Story }) {
  const { isAuthor } = useUser();
  const userIsAuthor = isAuthor(story.authorId);
  
  return (
    <div>
      {userIsAuthor && (
        <button>Editar</button>
      )}
    </div>
  );
}
```

## API del Hook `useUser()`

### Retorna

```typescript
{
  userId: string | null;     // ID del usuario autenticado o null
  loading: boolean;          // true mientras se carga el usuario
  isAuthor: (authorId: string | undefined) => boolean;  // Verifica autoría
}
```

### Detalles

- **`userId`**: 
  - `null` mientras carga o si no hay usuario
  - `string` con el ID cuando está autenticado
  
- **`loading`**: 
  - `true` en el montaje inicial mientras obtiene el userId
  - `false` después de cargar (con o sin usuario)
  
- **`isAuthor(authorId)`**:
  - Verifica si el usuario actual es el autor
  - Retorna `false` si no hay usuario, no hay authorId, o no coinciden
  - Retorna `true` solo si ambos existen y coinciden

## Testing

### En Tests Unitarios

Los tests que usan componentes con `useUser` necesitan el `UserProvider`. Usa el helper de `test-utils`:

```typescript
import { render, screen } from '../../setup/test-utils';

describe('MyComponent', () => {
  it('should render user info', () => {
    render(<MyComponent />);
    // El UserProvider está incluido automáticamente
  });
});
```

### En Tests de Hooks

```typescript
import { renderHook } from '../../setup/test-utils';

describe('useMyHook', () => {
  it('should use user context', () => {
    const { result } = renderHook(() => useMyHook());
    // El UserProvider está incluido automáticamente
  });
});
```

### Mock Manual del UserProvider

Si necesitas controlar los valores del contexto:

```typescript
import { UserProvider } from '@/contexts/UserContext';
import * as getClientUserIdModule from '@/lib/getClientUserId';

const mockGetClientUserId = jest.spyOn(
  getClientUserIdModule, 
  'getClientUserId'
);

beforeEach(() => {
  mockGetClientUserId.mockResolvedValue('test-user-123');
});

// En el test:
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <UserProvider>{children}</UserProvider>
);

renderHook(() => useMyHook(), { wrapper });
```

## Patrón ANTES vs DESPUÉS

### ❌ Antes (Código Duplicado)

```typescript
function MyComponent({ authorId }: { authorId: string }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthor, setIsAuthor] = useState(false);
  
  useEffect(() => {
    let mounted = true;
    
    getClientUserId().then((id) => {
      if (!mounted) return;
      setUserId(id);
      setIsAuthor(Boolean(id && authorId && id === authorId));
    });
    
    return () => {
      mounted = false;
    };
  }, [authorId]);
  
  return isAuthor ? <EditButton /> : null;
}
```

### ✅ Después (Con UserContext)

```typescript
function MyComponent({ authorId }: { authorId: string }) {
  const { isAuthor } = useUser();
  
  return isAuthor(authorId) ? <EditButton /> : null;
}
```

## Beneficios

1. **Menos código**: Elimina ~15 líneas de boilerplate por componente
2. **Sin race conditions**: No necesitas manejar cleanup manual
3. **Mejor rendimiento**: El userId se carga una vez, no en cada componente
4. **Fácil de testear**: Centralizado en un solo lugar
5. **Mantenible**: Cambios a la lógica de usuario en un solo archivo

## Cuándo NO usar UserContext

- **Server Components**: El contexto solo funciona en Client Components
- **Código del servidor**: En API routes, usa directamente `getServerUserId()`
- **Middleware**: El contexto no está disponible en middleware
- **Funciones utility**: Si no es un componente/hook, usa `getClientUserId()`

## Arquitectura

```
src/app/layout.tsx
  └── ClerkProvider
      └── UserProvider  ← Aquí se inicializa
          └── Children (toda la app)
              └── Tu componente
                  └── useUser() ← Accede al contexto
```

## Archivos Relacionados

- **Contexto**: `src/contexts/UserContext.tsx`
- **Tests**: `__tests__/unit/contexts/UserContext.test.tsx`
- **Test Utils**: `__tests__/setup/test-utils.tsx`
- **Tipo**: El tipo está inferido del hook, no necesitas importarlo

## Troubleshooting

### Error: "useUser must be used within a UserProvider"

**Causa**: Intentaste usar `useUser()` fuera del árbol del UserProvider.

**Solución**: 
- En la app: Verifica que `layout.tsx` tiene el `<UserProvider>`
- En tests: Importa `render` de `test-utils` en lugar de `@testing-library/react`

### El userId siempre es null

**Causa**: El usuario no está autenticado o Clerk no está configurado.

**Solución**: Verifica:
1. Usuario logueado en la app
2. Variables de entorno de Clerk configuradas
3. En tests, mockea `getClientUserId()` para retornar un valor

### Loading nunca termina

**Causa**: `getClientUserId()` falló o nunca se resolvió.

**Solución**: 
- Revisa errores en consola
- En tests, asegúrate de que el mock se resuelva correctamente
- Usa `waitFor` en tests para esperar a que termine de cargar
