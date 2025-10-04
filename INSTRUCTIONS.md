# 📝 Instrucciones y Preferencias del Proyecto

> Este archivo contiene instrucciones específicas y preferencias que deben seguirse durante el desarrollo del proyecto.

---

## 🎯 Instrucciones Generales

### Flujo de Trabajo
- [ ] Instrucción pendiente...

### Estándares de Código
- [ ] Instrucción pendiente...

### Testing
- [ ] Instrucción pendiente...

---

## 🚫 No Hacer (Anti-patterns)

### Código
- [ ] Instrucción pendiente...

### Git/Deployment
- **NUNCA** ejecutar `git add`, `git commit` o `git push`
- El usuario maneja personalmente todos los comandos de Git
- Solo proporcionar sugerencias de commit messages cuando se solicite

---

## ✅ Siempre Hacer (Best Practices)

### Antes de Commit
- [ ] Instrucción pendiente...

### Durante Desarrollo
- [ ] Instrucción pendiente...

---

## 🔧 Configuraciones Específicas

### Dependencias
- [ ] Instrucción pendiente...

### Variables de Entorno
- [ ] Instrucción pendiente...

---

## 📋 Checklist de Revisión

### Antes de PR
- [ ] Instrucción pendiente...

### Antes de Merge
- [ ] Instrucción pendiente...

---

## 💡 Notas del Desarrollador

### Preferencias Personales
- [ ] Instrucción pendiente...

### Comandos Favoritos
- [ ] Instrucción pendiente...

---

## 🔄 Última Actualización

**Fecha**: 2025-10-03  
**Por**: Mike  
**Cambios**: 
- Creación inicial del archivo
- Agregada instrucción sobre gestión de Git (solo Mike ejecuta comandos git)

---

## 📌 Instrucciones Específicas

### 📦 Gestión de Dependencias
- **SIEMPRE** usar la terminal para instalar dependencias: `pnpm add [dependency]` o `pnpm add -D [dependency]`
- **NUNCA** modificar directamente el `package.json` para agregar dependencias
- Usar `pnpm add -D` para devDependencies (testing, build tools, tipos)
- Usar `pnpm add` para dependencies (runtime, librerías de producción)

### 🛠️ Comandos NPM
- **SIEMPRE** usar `pnpm` en lugar de `npm` para ejecutar cualquier comando
- Usar `pnpm run [script]` o simplemente `pnpm [script]` para ejecutar scripts del package.json
- Ejemplos:
  - `pnpm dev` - Iniciar servidor de desarrollo
  - `pnpm build` - Construir el proyecto
  - `pnpm lint` - Ejecutar linter
  - `pnpm test` - Ejecutar tests

### 🎯 Flujo de Trabajo
- Avanzar paso por paso en implementaciones complejas
- Validar cada paso antes de continuar al siguiente
- Documentar decisiones importantes en archivos MD del proyecto

---

_Este archivo es un documento vivo. Actualízalo conforme descubras nuevas preferencias o reglas del proyecto._
