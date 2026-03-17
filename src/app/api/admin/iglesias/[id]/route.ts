import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { name, isActive } = await req.json();
    const params = await context.params;
    const id = params.id;

    const iglesia = await prisma.iglesia.update({
      where: { id },
      data: { name, isActive },
    });

    return NextResponse.json(iglesia);
  } catch (error) {
    return NextResponse.json({ message: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params.id;
    // Hard delete ya que es Admin
    await prisma.iglesia.delete({ where: { id } });
    return NextResponse.json({ message: "Eliminado con éxito" });
  } catch (error) {
    return NextResponse.json({ message: "Error al eliminar" }, { status: 500 });
  }
}
