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
    const ministerios = await prisma.ministerio.findMany({
      where: {
        lideresActivos: { some: { id: payload.id as string } }
      },
      include: { categoria: true }
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

    // Verificamos si este líder está realmente a cargo de este ministerio
    const authMin = await prisma.ministerio.findFirst({
      where: {
        id,
        lideresActivos: { some: { id: payload.id as string } }
      }
    });

    if (!authMin) return NextResponse.json({ message: "Ministerio no autorizado" }, { status: 403 });

    const ministerio = await prisma.ministerio.update({
      where: { id },
      data: { color, logoUrl }
    });

    return NextResponse.json(ministerio);
  } catch (error) {
    return NextResponse.json({ message: "Error al actualizar" }, { status: 500 });
  }
}
