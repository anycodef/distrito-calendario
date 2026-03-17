import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const iglesias = await prisma.iglesia.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    });
    return NextResponse.json(iglesias);
  } catch (error) {
    return NextResponse.json({ message: "Error al obtener iglesias" }, { status: 500 });
  }
}
