import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth/session";

import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get("session")?.value;
  if (!sessionCookie) return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  const payload = await decrypt(sessionCookie);
  if (!payload) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  try {
    const url = new URL(req.url);
    const context = url.searchParams.get("context");

    let whereClause: any = {};

    if (context === "supervisor") {
      // El supervisor gestiona *estrictamente* el ministerio de Distrito.
      // Si se buscaran todos los asignados, arrastraría Ministerios de Niños o Jóvenes
      // si el supervisor también tiene el rol de líder de esos.
      whereClause.name = { contains: "Distrito" };
    } else {
      // Si es LIDER, ve solo los ministerios a su cargo (para los cuales fue designado).
      whereClause.lideresActivos = { some: { id: payload.id as string } };
      // Se excluye "Distrito" para que no le salga en su panel de Líder.
      whereClause.name = { not: { contains: "Distrito" } };
    }

    let ministerios = await prisma.ministerio.findMany({
      where: whereClause,
      include: { categoria: true },
      orderBy: { name: "asc" }
    });

    // Fallback: Si el context es supervisor pero por alguna razón el ministerio "Distrito"
    // aún no ha sido creado en base de datos o tiene otro nombre exótico, devolvemos
    // un "falso" ministerio para que el UI no se rompa o se asigne internamente a "global".
    // Lo ideal es que el admin cree un ministerio llamado "Distrito 3".
    if (context === "supervisor" && ministerios.length === 0) {
       const globalFallback = {
         id: "global-distrito-id",
         name: "Distrito 3 (General)",
         color: "#1e40af", // blue-800
         categoria: { name: "Organización General" }
       };
       return NextResponse.json([globalFallback]);
    }

    return NextResponse.json(ministerios);
  } catch (error) {
    return NextResponse.json({ message: "Error al obtener ministerios" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const sessionCookie = req.cookies.get("session")?.value;
  if (!sessionCookie) return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  const payload = await decrypt(sessionCookie);
  if (!payload) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  try {
    const { id, color, logoUrl } = await req.json();
    const url = new URL(req.url);
    const context = url.searchParams.get("context");

    let isAuthorized = false;

    // Evitar error con el fallback ID
    if (id === "global-distrito-id") return NextResponse.json({ message: "Ministerio estático" }, { status: 400 });

    if (context === "supervisor") {
      const authMin = await prisma.ministerio.findFirst({
        where: { id, name: { contains: "Distrito" } }
      });
      if (authMin && (payload as any).roles.includes("SUPERVISOR")) {
        isAuthorized = true;
      }
    } else {
      const authMin = await prisma.ministerio.findFirst({
        where: {
          id,
          lideresActivos: { some: { id: payload.id as string } },
          name: { not: { contains: "Distrito" } }
        }
      });
      if (authMin) isAuthorized = true;
    }

    if (!isAuthorized) return NextResponse.json({ message: "Ministerio no autorizado" }, { status: 403 });

    const ministerio = await prisma.ministerio.update({
      where: { id },
      data: { color, logoUrl }
    });

    return NextResponse.json(ministerio);
  } catch (error) {
    return NextResponse.json({ message: "Error al actualizar" }, { status: 500 });
  }
}
