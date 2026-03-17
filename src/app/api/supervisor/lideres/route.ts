import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get("session")?.value;
  if (!sessionCookie) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const payload = await decrypt(sessionCookie);
  if (!payload || (!(payload as any).roles.includes("SUPERVISOR") && !(payload as any).roles.includes("ADMIN"))) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const lideres = await prisma.user.findMany({
      where: {
        isActive: true,
        roles: {
            has: "LIDER"
        }
      },
      select: {
        id: true,
        name: true,
        username: true,
        iglesia: {
            select: { name: true }
        },
        ministerios: {
            select: { name: true, color: true }
        }
      },
      orderBy: { name: "asc" }
    });

    return NextResponse.json(lideres);
  } catch (error) {
    return NextResponse.json({ message: "Error al obtener lista de líderes" }, { status: 500 });
  }
}
