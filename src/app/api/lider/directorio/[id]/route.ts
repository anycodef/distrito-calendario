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
    let { name, phone, roleLocal, iglesiaId, ministerioId, isActive } = await req.json();
    const params = await context.params;
    const id = params.id;

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
    const reqContext = url.searchParams.get("context");

    let isAuthorized = false;

    const contacto = await prisma.directorioLocal.findFirst({
      where: { id },
      include: { ministerio: true }
    });

    if (!contacto) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

    if (reqContext === "supervisor" && (payload as any).roles.includes("SUPERVISOR")) {
      if (contacto.ministerio?.name.includes("Distrito")) isAuthorized = true;
    } else {
      const isLider = await prisma.ministerio.findFirst({
        where: {
          id: contacto.ministerioId,
          lideresActivos: { some: { id: (payload as any).id as string } },
          name: { not: { contains: "Distrito" } }
        }
      });
      if (isLider) isAuthorized = true;
    }

    if (!isAuthorized) return NextResponse.json({ message: "No tienes permiso para editar este contacto" }, { status: 403 });

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

    const url = new URL(req.url);
    const reqContext = url.searchParams.get("context");

    let isAuthorized = false;

    const contacto = await prisma.directorioLocal.findFirst({
      where: { id },
      include: { ministerio: true }
    });

    if (!contacto) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

    if (reqContext === "supervisor" && (payload as any).roles.includes("SUPERVISOR")) {
      if (contacto.ministerio?.name.includes("Distrito")) isAuthorized = true;
    } else {
      const isLider = await prisma.ministerio.findFirst({
        where: {
          id: contacto.ministerioId,
          lideresActivos: { some: { id: (payload as any).id as string } },
          name: { not: { contains: "Distrito" } }
        }
      });
      if (isLider) isAuthorized = true;
    }

    if (!isAuthorized) return NextResponse.json({ message: "No tienes permiso para eliminar este contacto" }, { status: 403 });

    await prisma.directorioLocal.update({
      where: { id },
      data: { isActive: false }
    });

    return NextResponse.json({ message: "Contacto inhabilitado (Soft Delete)" });
  } catch (error) {
    return NextResponse.json({ message: "Error al eliminar" }, { status: 500 });
  }
}
