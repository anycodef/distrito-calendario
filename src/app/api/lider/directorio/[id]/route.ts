import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth/session";

import { NextRequest } from "next/server";

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const sessionCookie = req.cookies.get("session")?.value;
  if (!sessionCookie) return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  const payload = await decrypt(sessionCookie);
  if (!payload) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  try {
    const { name, phone, roleLocal, iglesiaId, ministerioId, isActive } = await req.json();
    const params = await context.params;
    const id = params.id;

    // Verificar que el contacto pertenezca a este líder (el supervisor gestiona solo los suyos)
    const contacto = await prisma.directorioLocal.findFirst({
      where: { id, liderId: payload.id as string }
    });

    if (!contacto) return NextResponse.json({ message: "No encontrado o sin permiso" }, { status: 404 });

    const updatedContacto = await prisma.directorioLocal.update({
      where: { id },
      data: { name, phone, roleLocal, iglesiaId, ministerioId, isActive }
    });

    return NextResponse.json(updatedContacto);
  } catch (error) {
    return NextResponse.json({ message: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const sessionCookie = req.cookies.get("session")?.value;
  if (!sessionCookie) return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  const payload = await decrypt(sessionCookie);
  if (!payload) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  try {
    const params = await context.params;
    const id = params.id;

    const contacto = await prisma.directorioLocal.findFirst({
      where: { id, liderId: payload.id as string }
    });

    if (!contacto) return NextResponse.json({ message: "No encontrado o sin permiso" }, { status: 404 });

    await prisma.directorioLocal.update({
      where: { id },
      data: { isActive: false }
    });

    return NextResponse.json({ message: "Contacto inhabilitado (Soft Delete)" });
  } catch (error) {
    return NextResponse.json({ message: "Error al eliminar" }, { status: 500 });
  }
}
