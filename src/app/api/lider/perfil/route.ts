import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth/session";

import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get("session")?.value;
  if (!sessionCookie) return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  const payload = await decrypt(sessionCookie);
  if (!payload) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: payload.id as string },
    select: { name: true, username: true, role: true }
  });

  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("session")?.value;
    if (!sessionCookie) return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    const payload = await decrypt(sessionCookie);
    if (!payload) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    const { newPassword } = await req.json();

    if (!newPassword || newPassword.trim().length < 6) {
      return NextResponse.json({ message: "La contraseña debe tener al menos 6 caracteres." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: payload.id as string },
      data: { password: hashedPassword }
    });

    return NextResponse.json({ message: "Contraseña actualizada exitosamente." });
  } catch (error) {
    return NextResponse.json({ message: "Error al actualizar contraseña." }, { status: 500 });
  }
}
