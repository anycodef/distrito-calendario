import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const iglesias = await prisma.iglesia.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(iglesias);
  } catch (error) {
    return NextResponse.json({ message: "Error al obtener iglesias" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ message: "Nombre requerido" }, { status: 400 });

    const iglesia = await prisma.iglesia.create({ data: { name } });
    return NextResponse.json(iglesia, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error al crear la iglesia" }, { status: 500 });
  }
}
