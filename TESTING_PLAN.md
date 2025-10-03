# 📋 Plan de Implementación: Suite de Testing Completa

## 🎯 Objetivo
Configurar una infraestructura robusta de testing con tres niveles:
1. **Tests Unitarios** - Funciones, hooks, utilidades
2. **Tests de Integración** - API routes, componentes con context
3. **Tests End-to-End (E2E)** - Flujos completos de usuario

---

## 📦 Fase 1: Tests Unitarios e Integración (Jest + React Testing Library)

### 1.1 Dependencias a Instalar
```bash
# Framework de testing
jest (^29.x)
@types/jest

# Jest con Next.js y TypeScript
ts-jest
jest-environment-jsdom

# React Testing Library
@testing-library/react (^16.x para React 19)
@testing-library/jest-dom
@testing-library/user-event

# Utilidades
@testing-library/react-hooks (para hooks personalizados)
```

### 1.2 Archivos de Configuración
- `jest.config.ts` - Configuración principal de Jest
- `jest.setup.ts` - Setup global (matchers, mocks, etc.)
- `.env.test` - Variables de entorno para testing

### 1.3 Scripts a Agregar
```json
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage",
"test:unit": "jest --testPathPattern=__tests__/unit",
"test:integration": "jest --testPathPattern=__tests__/integration"
```

### 1.4 Estructura de Directorios
```
__tests__/
├── unit/                    # Tests unitarios
│   ├── lib/                # Utilidades (mongodb, clerk, etc.)
│   ├── hooks/              # Hooks personalizados
│   └── utils/              # Funciones helpers
├── integration/            # Tests de integración
│   ├── api/               # API routes
│   └── components/        # Componentes con context/estado
├── fixtures/              # Datos de prueba
├── mocks/                 # Mocks reutilizables
│   ├── clerk.ts
│   ├── mongodb.ts
│   └── next-router.ts
└── setup/                 # Utilidades de setup
    └── test-utils.tsx     # Render wrapper con providers
```

---

## 🌐 Fase 2: Tests End-to-End (Playwright)

### 2.1 Dependencias a Instalar
```bash
# Playwright
@playwright/test
@playwright/experimental-ct-react (para component testing)

# Utilidades
dotenv-cli (para cargar env en E2E)
```

### 2.2 Archivos de Configuración
- `playwright.config.ts` - Configuración de Playwright
- `.env.e2e` - Variables de entorno específicas para E2E
- `e2e/global-setup.ts` - Setup antes de todos los tests E2E
- `e2e/global-teardown.ts` - Cleanup después de E2E

### 2.3 Scripts a Agregar
```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui",
"test:e2e:headed": "playwright test --headed",
"test:e2e:debug": "playwright test --debug",
"test:e2e:report": "playwright show-report"
```

### 2.4 Estructura de Directorios
```
e2e/
├── tests/
│   ├── auth.spec.ts         # Sign in/up flows
│   ├── stories.spec.ts      # Story CRUD
│   ├── chapters.spec.ts     # Chapter management
│   └── comments.spec.ts     # Comments functionality
├── fixtures/
│   └── test-data.ts         # Datos de prueba E2E
├── pages/                   # Page Object Model
│   ├── BasePage.ts
│   ├── HomePage.ts
│   ├── StoriesPage.ts
│   └── EditorPage.ts
└── utils/
    └── auth-helpers.ts      # Helpers de autenticación
```

---

## 🔧 Fase 3: Configuración de Mocks y Utilidades

### 3.1 Mocks Críticos a Crear
```typescript
// __tests__/mocks/clerk.ts
- Mock de useUser, useAuth, useClerk
- Mock de clerkClient (server-side)

// __tests__/mocks/mongodb.ts
- Mock de mongoose.connect
- Mock de modelos (Story, Chapter, Comment, User)

// __tests__/mocks/next.ts
- Mock de next/navigation (useRouter, redirect, etc.)
- Mock de next/headers (cookies, headers)

// __tests__/mocks/fetch.ts
- Mock global de fetch para API calls
```

### 3.2 Test Utilities
```typescript
// __tests__/setup/test-utils.tsx
- Custom render con ClerkProvider mock
- Helper para crear stories/chapters de prueba
- Helper para simular usuarios autenticados
```

---

## 📊 Fase 4: Integración con CI/CD y Git Hooks

### 4.1 Actualizar Git Hooks
```bash
# .husky/pre-push (actualizar)
- Agregar: pnpm test:unit
- Mantener: pnpm lint && pnpm build

# Opcional: .husky/pre-commit
- pnpm test (solo tests relacionados con cambios)
```

### 4.2 Scripts de Testing Completo
```json
"test:all": "pnpm test && pnpm test:e2e",
"test:ci": "pnpm test:coverage && pnpm test:e2e",
"validate:full": "pnpm lint && pnpm test:all && pnpm build"
```

---

## 🎯 Fase 5: Primeros Tests a Implementar

### 5.1 Tests Unitarios Prioritarios
1. **Hooks**:
   - `useMyStories.test.ts`
   - `useBufferedPagedStories.test.ts`
   - `useChapters.test.ts`

2. **Utilities**:
   - `getClientUserId.test.ts`
   - `chapterProgress.test.ts`

### 5.2 Tests de Integración Prioritarios
1. **API Routes**:
   - `GET /api/stories` - Listar stories
   - `POST /api/stories` - Crear story
   - `DELETE /api/stories/:id` - Eliminar story
   - `POST /api/stories/:id/comments` - Crear comentario

2. **Componentes Críticos**:
   - `Navbar.test.tsx` - Navegación y auth state
   - `StoryCard.test.tsx` - Display de stories
   - `ChapterEditor.test.tsx` - Editor de capítulos

### 5.3 Tests E2E Prioritarios
1. **Flujos de Autenticación**:
   - Sign up → Verify → Dashboard
   - Sign in → Dashboard
   - Logout → Homepage

2. **Story Lifecycle**:
   - Create story → Add chapters → Publish → View

3. **Interacciones Sociales**:
   - View published story → Add comment → Bravo

---

## 📈 Coverage Goals

### Targets Iniciales
- **Unit Tests**: 70%+ coverage
- **Integration Tests**: API routes 80%+
- **E2E Tests**: Critical paths 100%

### Coverage por Área
```
src/lib/          → 80%+ (utilidades críticas)
src/hooks/        → 75%+ (lógica de negocio)
src/api/          → 80%+ (endpoints críticos)
src/components/   → 60%+ (componentes principales)
```

---

## ⚙️ Configuraciones Especiales

### Next.js 15 con Turbopack
- Jest no soporta Turbopack directamente
- Usar `ts-jest` con transformers personalizados
- Configurar moduleNameMapper para alias `@/*`

### React 19
- Usar versiones compatibles de Testing Library
- Testing Library React 16+ soporta React 19

### Clerk Authentication
- Mocks completos de hooks y API
- Test con usuarios autenticados/no autenticados
- Stub de redirects

### MongoDB/Mongoose
- Usar `mongodb-memory-server` para tests de integración
- Mocks de modelos para tests unitarios
- Cleanup de DB entre tests

---

## 🚀 Plan de Ejecución

### ✅ Día 1: Setup Básico (COMPLETADO)
- [x] Instalar dependencias de Jest y RTL
- [x] Crear configuración de Jest
- [x] Configurar mocks básicos (CSS, archivos estáticos)
- [x] Crear primer test unitario (smoke test)
- [x] **BONUS**: Crear mocks críticos (Clerk, MongoDB, fetch)
- [x] **BONUS**: Crear test utilities y fixtures
- [x] **BONUS**: Primer test real (getClientUserId) ✨

### ✅ Día 2-3: Tests Unitarios (PARCIALMENTE COMPLETADO - 70%)
- [x] Tests de utilidades - **98.48% coverage** ✨
  - [x] chapterProgress.test.ts (100%)
  - [x] getClientUserId.test.ts (91.66%)
  - [x] clerk.test.ts (100%)
  - [x] clerk-client.test.ts (100%)
  - [x] clerk-oauth.test.ts (100%)
  - [x] mongodb.test.ts (100%)
  - [x] useChapters.test.ts (98%)
  - [x] useStories.test.ts (100%)
- [x] Tests de hooks principales - **98.98% coverage** ✨
  - [x] useBufferedPagedStories.test.tsx (99.09%, 23 tests)
  - [x] useMyStories.test.tsx (98.27%, 21 tests)
  - [x] useMyStoriesPaged.test.tsx (100%)
- [x] Tests de componentes básicos - **PARCIAL**
  - [x] Button.test.tsx (100%)
  - [x] Icons.test.tsx (100%, 4 iconos)
  - [x] Navbar.test.tsx (100%)
  - [x] StoryCard.test.tsx (89.28%, 30 tests)
- [ ] Tests de componentes críticos - **EN PROGRESO**
  - [ ] BravoButton.test.tsx (0%)
  - [ ] Comments.test.tsx (0%)
  - [ ] ChapterEditor.test.tsx (0%)
  - [ ] StoryFormClient.test.tsx (0%)

**Estado actual:** 326 tests pasando, 21.61% coverage global

### ⏳ Día 4: Componentes Críticos (EN PROGRESO)
- [x] BravoButton.test.tsx - **100% coverage** (21 tests) ✨
- [ ] Comments.test.tsx - Sistema de comentarios
- [ ] ChapterEditor.test.tsx - Editor de capítulos
- [ ] StoryFormClient.test.tsx - Formulario de stories
- [ ] **META**: Alcanzar 35-40% coverage global

**Progreso actual:** 23.58% coverage global (↑1.97%)

### ⏳ Día 5-6: Tests de Integración
- [ ] Instalar mongodb-memory-server
- [ ] Tests de API routes críticos (stories, chapters)
- [ ] Tests de autenticación y autorización
- [ ] **META**: 80%+ coverage en API routes

### ⏳ Día 7-8: E2E con Playwright
- [ ] Instalar y configurar Playwright
- [ ] Crear Page Objects
- [ ] Implementar flujos críticos (auth, story lifecycle)
- [ ] **META**: Flujos críticos cubiertos

### ⏳ Día 9: Integración y CI
- [ ] Actualizar pre-push hook con tests
- [ ] Configurar coverage reports automáticos
- [ ] Documentación de testing completa
- [ ] **META**: Pipeline de CI completo

---

## 📝 Notas Importantes

### ⚠️ Consideraciones
- **Turbopack**: Jest no lo soporta nativamente, usaremos ts-jest
- **Server Components**: Algunos componentes necesitarán estrategias especiales
- **Clerk**: Necesitaremos mocks robustos para autenticación
- **MongoDB**: Usar memoria para tests rápidos, evitar DB real

### 🎨 Best Practices
- **AAA Pattern**: Arrange → Act → Assert
- **Test Isolation**: Cada test independiente
- **Descriptive Names**: Tests auto-documentados
- **Coverage != Quality**: Enfocarse en casos críticos
- **DRY**: Reutilizar fixtures y helpers
- **Fast Tests**: Unit tests < 1s, Integration < 5s
- **Deterministic**: Mismos resultados en cada ejecución

---

## ❓ Decisiones Pendientes

1. **¿Incluir tests visuales/snapshot?** (Jest snapshots o Playwright visual regression)
2. **¿Test de performance?** (Lighthouse CI, bundle size)
3. **¿Mutation testing?** (Stryker para verificar calidad de tests)
4. **¿Contract testing?** (Pact para APIs si hay múltiples consumers)

---

## 📚 Recursos

### Documentación
- [Jest](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright](https://playwright.dev/docs/intro)
- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing)

### Guías
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Kent C. Dodds - Testing Blog](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Clerk Testing Guide](https://clerk.com/docs/testing/overview)

---

## 🔄 Estado Actual

**Última actualización**: 2025-10-03 (Actualizado)

**Fase actual**: Día 4 - Tests de Componentes Críticos

**Próximo paso**: Implementar tests de BravoButton, Comments, ChapterEditor y StoryFormClient

**Progreso:**
- ✅ Setup completo (Jest, RTL, mocks, utilities)
- ✅ Tests unitarios de lib/ (98.48% coverage)
- ✅ Tests unitarios de hooks/ (98.98% coverage)
- ✅ Tests básicos de componentes (Button, Icons, Navbar, StoryCard)
- 🔄 Tests de componentes críticos (EN PROGRESO)
- ⏳ Tests de integración (pendiente)
- ⏳ E2E con Playwright (pendiente)

**Estadísticas:**
- **347 tests** pasando (+21 desde última actualización)
- **23.58%** coverage global (objetivo: 50%+)
- **0 errores** de linting
- **17 test suites** ejecutándose

---

## 💡 Comandos Rápidos

```bash
# Instalar dependencias de testing
pnpm add -D jest @types/jest ts-jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Ejecutar tests
pnpm test                  # Todos los tests
pnpm test:watch           # Watch mode
pnpm test:coverage        # Con coverage
pnpm test:unit            # Solo unitarios
pnpm test:integration     # Solo integración

# Validación completa
pnpm validate             # lint + build
pnpm validate:full        # lint + test + build (cuando esté configurado)
```
