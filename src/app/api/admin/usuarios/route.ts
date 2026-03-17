import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    const usuarios = await prisma.user.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    return NextResponse.json(usuarios);
  } catch (error) {
    return NextResponse.json({ message: "Error al obtener usuarios" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, username, password, role } = await req.json();

    if (!name || !username || !password || !role) {
      return NextResponse.json({ message: "Todos los campos son requeridos" }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) {
      return NextResponse.json({ message: "El nombre de usuario ya existe" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
        role,
      },
    });

    return NextResponse.json({ message: "Usuario creado", id: user.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error al crear usuario" }, { status: 500 });
  }
}
