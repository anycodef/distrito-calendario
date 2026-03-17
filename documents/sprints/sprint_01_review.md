# Sprint 1: Fundación y Base de Datos (Core) - Review

El Sprint 1 ha sido completado con éxito. Este documento refleja el trabajo realizado, las decisiones técnicas clave y sirve como guía para levantar el proyecto en un entorno local para realizar las pruebas correspondientes.

## 1. Resumen de Entregables
*   **Proyecto Inicializado:** Next.js (App Router), TypeScript, Tailwind CSS y ESLint configurados.
*   **Base de Datos y ORM:** Prisma ORM integrado. Se creó el esquema de la base de datos `schema.prisma` respetando estrictamente los requerimientos (Roles, Iglesias, Categorías, Ministerios, Líderes y la relación de Muchos a Muchos para los multiministerios).
*   **Autenticación Core:** Se desarrolló la lógica de login utilizando la librería `bcrypt` para las contraseñas y `jose` para generar un JWT seguro, almacenado en una *cookie HttpOnly* (`/api/auth/login`).
*   **Seed Automático:** Script para poblar la base de datos inicial con un Súper Administrador, las 8 iglesias locales y 3 categorías de ministerios.

## 2. Decisiones Técnicas y Ajustes Post-Desarrollo
*   **Seguridad del Súper Administrador:** Siguiendo los requerimientos, la contraseña por defecto del Súper Administrador en el script de Seed ha sido configurada de manera segura (`Sup3r@dm1n!C0mpl3x2024`) y encriptada, descartando opciones fáciles (como `admin123`).
*   **Gestión de JWT Edge-compatible:** Se eligió usar la librería `jose` en lugar de `jsonwebtoken` porque la lógica de autenticación (que se ejecutará frecuentemente, incluso en Middlewares) necesita ser compatible con el *Edge Runtime* de plataformas como Vercel.
*   **Tailwind PostCSS:** Para mantener la velocidad en Next.js, se integró Tailwind directamente con la configuración base `@import "tailwindcss";` en el archivo CSS global.

---

## 3. Guía: Cómo Levantar y Probar el Proyecto

Sigue estos pasos para ejecutar el proyecto en tu máquina y probar la pantalla de inicio de sesión de este Sprint:

### Paso 1: Requisitos Previos
Asegúrate de tener instalados:
*   [Node.js](https://nodejs.org/) (versión 18 o superior).
*   Una base de datos **PostgreSQL** (puedes instalarla localmente o crear un proyecto gratuito en la nube como Neon, Supabase o Render).

### Paso 2: Instalación de Dependencias
Abre una terminal en la raíz del proyecto y ejecuta:
```bash
npm install
```

### Paso 3: Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto (a la misma altura que `package.json`). Copia el siguiente contenido y reemplaza `<URL_DE_TU_BASE_DE_DATOS>` por tu cadena de conexión real de PostgreSQL:

```env
# URL de conexión a tu PostgreSQL
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/distrito_db?schema=public"

# Clave secreta para firmar los JWT (Cámbiala en producción)
JWT_SECRET_KEY="tu-clave-secreta-super-segura-distrito3"

# Credenciales del super admin para el script de seed
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="MiPasswordSecretaYPersonalizada"
```

### Paso 4: Migración y Seed (Poblar la Base de Datos)
Para crear las tablas en la base de datos vacía y ejecutar el script de inserción del Súper Administrador, ejecuta los siguientes comandos en orden:

```bash
# 1. Empujar el esquema a la base de datos (crear tablas)
npx prisma db push

# 2. Generar el cliente de Prisma
npx prisma generate

# 3. Poblar la base de datos (Iglesias, Categorías y Súper Admin)
npx prisma db seed
```

### Paso 5: Levantar el Servidor
Inicia el entorno de desarrollo:
```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## 4. Pruebas Funcionales (Login)

Para probar la lógica implementada en este Sprint:
1. Navega a la ruta de inicio de sesión: **http://localhost:3000/login**
2. **Prueba Error:** Intenta ingresar datos inválidos para confirmar que los mensajes de error de seguridad (Credenciales inválidas) funcionan.
3. **Prueba Éxito (Admin):** Ingresa las credenciales del Administrador que definiste en tus variables de entorno antes de ejecutar el script *seed*.
4. Al hacer clic en "Ingresar", el sistema generará una *Cookie* segura en tu navegador y te redirigirá a `/dashboard/admin` (actualmente mostrará error 404 ya que los dashboards se construirán en el Sprint 2). Esto confirma que el flujo de autenticación, validación con *bcrypt* y asignación de JWT funciona perfectamente.
