import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { name, isActive } = await req.json();
    const params = await context.params;
    const id = params.id;

    const categoria = await prisma.categoriaMinisterio.update({
      where: { id },
      data: { name, isActive },
    });

    return NextResponse.json(categoria);
  } catch (error) {
    return NextResponse.json({ message: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params.id;
    // Hard delete
    await prisma.categoriaMinisterio.delete({ where: { id } });
    return NextResponse.json({ message: "Eliminado con éxito" });
  } catch (error) {
    return NextResponse.json({ message: "Error al eliminar" }, { status: 500 });
  }
}
