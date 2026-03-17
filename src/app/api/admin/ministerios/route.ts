import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const ministerios = await prisma.ministerio.findMany({
      orderBy: { name: "asc" },
      include: {
        categoria: true,
        lideresActivos: {
          select: { id: true, name: true, username: true }
        }
      }
    });
    return NextResponse.json(ministerios);
  } catch (error) {
    return NextResponse.json({ message: "Error al obtener ministerios" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, color, categoriaId, liderId } = await req.json();

    if (!name || !categoriaId) {
      return NextResponse.json({ message: "El nombre y la categoría son requeridos" }, { status: 400 });
    }

    // Preparar relaciones (Lider si aplica)
    const connectLideres = liderId ? [{ id: liderId }] : [];

    const ministerio = await prisma.ministerio.create({
      data: {
        name,
        color: color || "#FFFFFF",
        categoria: { connect: { id: categoriaId } },
        lideresActivos: {
          connect: connectLideres
        }
      },
    });

    // Registrar en Historial si hubo asignación de líder inicial
    if (liderId) {
      await prisma.historialLider.create({
        data: {
          ministerioId: ministerio.id,
          userId: liderId,
          startDate: new Date(),
        }
      });
    }

    return NextResponse.json(ministerio, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ message: "El ministerio ya existe" }, { status: 400 });
    return NextResponse.json({ message: "Error al crear el ministerio" }, { status: 500 });
  }
}
