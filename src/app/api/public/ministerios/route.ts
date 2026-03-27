import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const ministerios = await prisma.ministerio.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        color: true,
        logoUrl: true,
        categoria: {
          select: { name: true }
        }
      },
      orderBy: { name: "asc" }
    });

    return NextResponse.json(ministerios);
  } catch (error) {
    console.error("Error fetching public ministerios:", error);
    return NextResponse.json({ message: "Error al obtener ministerios" }, { status: 500 });
  }
}
