import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const payload = await decrypt(sessionCookie);
    if (!payload || (!(payload as any).roles.includes("LIDER") && !(payload as any).roles.includes("SUPERVISOR"))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { startDate, endDate, ignoreEventoId } = body;

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Faltan fechas obligatorias para comprobar conflictos" }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    let whereClause: any = {
      isActive: true,
      status: "PUBLISHED",
      OR: [
        // El evento existente empieza durante el nuevo evento
        {
          startDate: {
            gte: start,
            lt: end, // < end para no contar choques exactos de fin con inicio
          }
        },
        // El evento existente termina durante el nuevo evento
        {
          endDate: {
            gt: start, // > start para no contar choques exactos de fin con inicio
            lte: end,
          }
        },
        // El evento existente envuelve completamente al nuevo evento
        {
          startDate: {
            lte: start,
          },
          endDate: {
            gte: end,
          }
        }
      ]
    };

    // Si estamos editando un evento, ignoramos sus propios conflictos
    if (ignoreEventoId) {
      whereClause.id = {
        not: ignoreEventoId
      };
    }

    const conflictos = await prisma.evento.findMany({
      where: whereClause,
      include: {
        ministerio: {
          select: {
            name: true,
            color: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    return NextResponse.json(conflictos);
  } catch (error) {
    console.error("Error comprobando conflictos de eventos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
