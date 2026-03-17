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
      // El supervisor gestiona el ministerio global, asumimos nombre especial "Distrito" o "Global"
      // En un caso robusto, habría un flag 'isDistrito: true', aquí usaremos nombre por convención.
      whereClause.name = { contains: "Distrito" };
    } else {
      // Si es LIDER o no especificó contexto, ve solo los ministerios a su cargo.
      whereClause.lideresActivos = { some: { id: payload.id as string } };
      // Excluir el de distrito si lo tuviera asignado por error o cruce
      whereClause.name = { not: { contains: "Distrito" } };
    }

    const ministerios = await prisma.ministerio.findMany({
      where: whereClause,
      include: { categoria: true },
      orderBy: { name: "asc" }
    });
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

    if (context === "supervisor") {
      // Si está en contexto supervisor, y el ministerio es el de Distrito, autorizar.
      const authMin = await prisma.ministerio.findFirst({
        where: { id, name: { contains: "Distrito" } }
      });
      if (authMin && (payload as any).roles.includes("SUPERVISOR")) {
        isAuthorized = true;
      }
    } else {
      // Verificamos si este líder está realmente a cargo de este ministerio
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
