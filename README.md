# Nevara — Inventario y Ventas

Aplicación de inventario, ventas y facturación de Nevara Beauty Makeup.
Next.js (App Router) + Supabase (Postgres + Auth). Sin backend propio:
el navegador habla directo contra la API REST de Supabase (PostgREST),
protegida por Row Level Security.

## 1. Configurar variables de entorno

Copia `.env.example` a `.env.local` y completa:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_EMAILJS_SERVICE_ID=...
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=...
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=...
```

## 2. Base de datos

Corre `nevara_schema.sql` en el SQL Editor de tu proyecto de Supabase
(tablas, RLS y la función `create_sale`).

Crea manualmente los 1-2 usuarios en Authentication → Users (email/password).

## 3. Logo

Reemplaza `/public/logo.png` con el logo real de Nevara (usado en el
header y en la factura).

## 4. Correr localmente

```
npm install
npm run dev
```

## 5. Desplegar en Vercel

Conecta el repo a Vercel y define las mismas variables de entorno en
Project Settings → Environment Variables.

## Arquitectura

```
app/                    → páginas (rutas) de Next.js
components/             → UI reutilizable
lib/services/           → capa de acceso a datos (habla con Supabase)
lib/context/            → estado compartido (products, clients, sales)
lib/utils/               → helpers de formato y estilos compartidos
```

Toda mutación (agregar producto, registrar venta, actualizar cliente)
pasa por un servicio en `lib/services/`, nunca directo desde los
componentes. La venta se registra de forma atómica vía la función RPC
`create_sale` en Postgres (genera el número de factura y descuenta
stock en una sola transacción, evitando condiciones de carrera).
