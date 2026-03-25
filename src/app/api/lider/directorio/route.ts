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

    if (context === "supervisor" && (payload as any).roles.includes("SUPERVISOR")) {
      whereClause.ministerio = { name: { contains: "Distrito" } };
    } else {
      whereClause.ministerio = {
         lideresActivos: { some: { id: (payload as any).id as string } },
         name: { not: { contains: "Distrito" } }
      };
    }

    const directorio = await prisma.directorioLocal.findMany({
      where: whereClause,
      include: {
        iglesia: true,
        ministerio: { select: { id: true, name: true, color: true } }
      },
      orderBy: { name: "asc" }
    });
    return NextResponse.json(directorio);
  } catch (error) {
    return NextResponse.json({ message: "Error al obtener directorio" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get("session")?.value;
  if (!sessionCookie) return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  const payload = await decrypt(sessionCookie);
  if (!payload) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  try {
    let { name, phone, roleLocal, iglesiaId, ministerioId } = await req.json();

    if (!name || !roleLocal || !iglesiaId || !ministerioId) {
      return NextResponse.json({ message: "Campos requeridos faltantes" }, { status: 400 });
    }

    if (iglesiaId === "sin-iglesia-id") {
      let generalIglesia = await prisma.iglesia.findFirst({
        where: { name: { contains: "General" } }
      });
      if (!generalIglesia) {
        generalIglesia = await prisma.iglesia.create({
          data: { name: "Sede General / Distrito" }
        });
      }
      iglesiaId = generalIglesia.id;
    }

    const url = new URL(req.url);
    const context = url.searchParams.get("context");

    let isAuthorized = false;

    if (context === "supervisor") {
      const authMin = await prisma.ministerio.findFirst({
        where: { id: ministerioId, name: { contains: "Distrito" } }
      });
      if (authMin && (payload as any).roles.includes("SUPERVISOR")) isAuthorized = true;
    } else {
      const authMin = await prisma.ministerio.findFirst({
        where: {
          id: ministerioId,
          lideresActivos: { some: { id: (payload as any).id as string } },
          name: { not: { contains: "Distrito" } }
        }
      });
      if (authMin) isAuthorized = true;
    }

    if (!isAuthorized) return NextResponse.json({ message: "No tienes permiso en este ministerio" }, { status: 403 });

    const contacto = await prisma.directorioLocal.create({
      data: {
        name,
        phone,
        roleLocal,
        iglesiaId,
        ministerioId,
        liderId: payload.id as string
      }
    });

    return NextResponse.json(contacto, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error al crear contacto" }, { status: 500 });
  }
}
