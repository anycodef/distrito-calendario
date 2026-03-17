import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const payload = await decrypt(sessionCookie);
    if (!payload || (!(payload as any).roles.includes("LIDER") && !(payload as any).roles.includes("SUPERVISOR"))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let whereClause: any = {
        isActive: true,
    };

    // Si es lider, solo ve los que él creó. Si es Supervisor, los ve todos para gestionar.
    if (!(payload as any).roles.includes("SUPERVISOR")) {
        whereClause.creatorId = (payload as any).id as string;
    }

    if (status) {
        whereClause.status = status;
    }

    const misEventos = await prisma.evento.findMany({
      where: whereClause,
      include: {
        ministerio: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    return NextResponse.json(misEventos);
  } catch (error) {
    console.error("Error fetching mis eventos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
