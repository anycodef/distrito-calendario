import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categorias = await prisma.categoriaMinisterio.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categorias);
  } catch (error) {
    return NextResponse.json({ message: "Error al obtener categorías" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ message: "Nombre requerido" }, { status: 400 });

    const categoria = await prisma.categoriaMinisterio.create({ data: { name } });
    return NextResponse.json(categoria, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error al crear la categoría" }, { status: 500 });
  }
}
