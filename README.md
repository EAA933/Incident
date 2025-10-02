# Incident Manager (IndexedDB / Dexie, Next.js + Tailwind)

**Fijo el alias de imports**: ahora todos los imports usan `@/` (por ejemplo `@/db`, `@/types`), coherentes con `"paths": { "@/*": ["./src/*"] }` en `tsconfig.json`.

## Ejecutar
```bash
npm i
npm run dev
# http://localhost:3000
```

## Notas
- Si cambias `tsconfig.json`, reinicia el servidor de dev para que Next.js recargue el alias.
