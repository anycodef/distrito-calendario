# Plataforma Distrital - Calendario y Gestión de Ministerios
Distrito 3, Área 6 - Iglesia de Dios de la Profecía.

Esta aplicación es una solución a la medida desarrollada bajo el marco ágil de Sprints, enfocada en la facilidad de uso y la administración centralizada de las actividades ministeriales del distrito.

## Stack Tecnológico
- **Frontend/Backend:** Next.js (App Router) + TypeScript
- **Base de Datos y ORM:** PostgreSQL + Prisma
- **Estilos:** Tailwind CSS
- **Seguridad:** JWT (con `jose`) y `bcrypt` para autenticación con cookies HttpOnly.

---

## Documentación y Requerimientos

El proyecto se planificó y estructuró cuidadosamente antes de escribir código. Toda la documentación está disponible en la carpeta `/documents`.
- **General y Arquitectura:** `documents/01_planificacion_general.md`
- **Lógica de Negocio:** `documents/02_requerimientos.md`
- **Roles y Permisos:** `documents/03_roles_y_permisos.md`
- **Planificación Ágil:** `documents/sprints/00_planificacion_sprints.md`
- **Reviews de Sprints:** `documents/sprints/`

---

## ¿Cómo Empezar? (Guía Rápida - Sprint 1)

Sigue estos pasos para levantar el entorno de desarrollo y probar el sistema de inicio de sesión base:

### 1. Variables de Entorno
Clona este repositorio, crea un archivo `.env` en la raíz y configura tus variables de entorno para la base de datos PostgreSQL y la seguridad:

```env
DATABASE_URL="postgresql://USUARIO:CONTRASEÑA@HOST:PUERTO/distrito_db?schema=public"
JWT_SECRET_KEY="tu-clave-secreta-segura-distrito3"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="TuPasswordDificilPersonalizado"
```

### 2. Instalar y Levantar

```bash
# 1. Instalar dependencias
npm install

# 2. Empujar el esquema de Prisma y generar cliente
npx prisma db push
npx prisma generate

# 3. Poblar la base de datos (Súper Administrador, 8 iglesias y categorías iniciales)
npx prisma db seed

# 4. Iniciar servidor de desarrollo
npm run dev
```

### 3. Probar Autenticación Core
Abre [http://localhost:3000/login](http://localhost:3000/login).
Prueba ingresar con las credenciales que configuraste en tu archivo `.env` antes de correr el comando `seed`:

- **Usuario:** `el_usuario_de_tu_env`
- **Contraseña:** `la_contraseña_de_tu_env`
