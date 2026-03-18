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
      // El supervisor gestiona el ministerio global.
      // Como no hay flag nativo, buscamos "Distrito" u "Organización General", o el ministerio sin categoria
      // Lo más genérico: aquellos asignados a él y que representen el distrito (al ser Multi-Rol,
      // asumimos que el admin le asignó el ministerio principal).
      whereClause.lideresActivos = { some: { id: payload.id as string } };
    } else {
      // Si es LIDER, ve solo los ministerios a su cargo (para los cuales fue designado).
      whereClause.lideresActivos = { some: { id: payload.id as string } };
      // Opcional: si existe "Distrito", se excluye de su panel normal de Líder.
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
      const authMin = await prisma.ministerio.findFirst({
        where: { id, lideresActivos: { some: { id: payload.id as string } } }
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
