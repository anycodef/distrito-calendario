import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando Seed de la base de datos...");

  // 1. Crear el Súper Administrador por defecto
  const defaultAdminUsername = process.env.ADMIN_USERNAME || "admin";
  const defaultAdminPassword = process.env.ADMIN_PASSWORD;

  if (!defaultAdminPassword) {
    throw new Error("⚠️ ERROR: La variable de entorno ADMIN_PASSWORD no está definida. Es obligatoria para inicializar el administrador.");
  }

  const adminPassword = await bcrypt.hash(defaultAdminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { username: defaultAdminUsername },
    update: {},
    create: {
      username: defaultAdminUsername,
      password: adminPassword,
      name: "Súper Administrador",
      role: "ADMIN",
    },
  });
  console.log("✅ Administrador creado/verificado:", admin.username);

  // 2. Crear Categorías de Ministerios Básicas
  const categorias = ["Especializados", "Departamentos", "Grupos Familiares"];

  for (const catName of categorias) {
    await prisma.categoriaMinisterio.upsert({
      where: { name: catName },
      update: {},
      create: { name: catName },
    });
  }
  console.log("✅ Categorías base creadas.");

  // 3. Crear Iglesias Locales por defecto (8 iglesias del Distrito 3, Área 6)
  // Nota: Nombres de ejemplo, podrán ser editados luego por el admin.
  const iglesias = [
    "Iglesia Local 1",
    "Iglesia Local 2",
    "Iglesia Local 3",
    "Iglesia Local 4",
    "Iglesia Local 5",
    "Iglesia Local 6",
    "Iglesia Local 7",
    "Iglesia Local 8",
  ];

  for (const iglesiaName of iglesias) {
    await prisma.iglesia.upsert({
      where: { name: iglesiaName },
      update: {},
      create: { name: iglesiaName },
    });
  }
  console.log("✅ Iglesias locales base creadas.");

  console.log("🎉 Seed completado exitosamente.");
}

main()
  .catch((e) => {
    console.error("Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
