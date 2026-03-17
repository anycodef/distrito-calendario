import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { name, username, password, roles, iglesiaId, isActive } = await req.json();
    const params = await context.params;
    const id = params.id;

    const dataToUpdate: any = { name, username, roles, iglesiaId: iglesiaId || null, isActive };

    if (!roles || roles.length === 0) {
      return NextResponse.json({ message: "El usuario debe tener al menos un rol" }, { status: 400 });
    }

    // Si envían contraseña, actualizarla (reset password)
    if (password && password.trim() !== "") {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: { id: true, name: true, username: true, roles: true, iglesiaId: true, isActive: true },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    if (error.code === 'P2002') {
       return NextResponse.json({ message: "Ese nombre de usuario ya existe" }, { status: 400 });
    }
    return NextResponse.json({ message: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params.id;

    // Verificar si es el último o único admin antes de borrar, pero por simplicidad de este ejemplo permitiremos el soft delete
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Usuario desactivado con éxito" });
  } catch (error) {
    return NextResponse.json({ message: "Error al desactivar el usuario" }, { status: 500 });
  }
}
