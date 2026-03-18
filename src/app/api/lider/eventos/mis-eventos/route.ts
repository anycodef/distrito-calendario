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
    const context = searchParams.get('context');

    let whereClause: any = {
        isActive: true,
    };

    if (context === "supervisor" && (payload as any).roles.includes("SUPERVISOR")) {
      // El supervisor gestiona eventos del ministerio Distrito (independientemente de qué usuario/supervisor lo creó)
      whereClause.ministerio = { name: { contains: "Distrito" } };
    } else {
      // El lider gestiona eventos que pertenecen a los ministerios que él lidera actualmente.
      // (La identidad del evento está atada al Ministerio, no al usuario que lo creó).
      whereClause.ministerio = {
         lideresActivos: { some: { id: (payload as any).id as string } },
         name: { not: { contains: "Distrito" } }
      };
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
