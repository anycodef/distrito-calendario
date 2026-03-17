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
    const directorio = await prisma.directorioLocal.findMany({
      where: {
        liderId: payload.id as string
      },
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
    const { name, phone, roleLocal, iglesiaId, ministerioId } = await req.json();

    if (!name || !roleLocal || !iglesiaId || !ministerioId) {
      return NextResponse.json({ message: "Campos requeridos faltantes" }, { status: 400 });
    }

    // Validar que el ministerio seleccionado pertenezca a este líder
    const authMin = await prisma.ministerio.findFirst({
      where: {
        id: ministerioId,
        lideresActivos: { some: { id: payload.id as string } }
      }
    });

    if (!authMin) return NextResponse.json({ message: "No tienes permiso en este ministerio" }, { status: 403 });

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
