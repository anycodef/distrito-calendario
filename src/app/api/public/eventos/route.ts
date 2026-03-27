import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { addDays } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const ministerioId = url.searchParams.get("ministerioId");
    const limitParams = url.searchParams.get("limit");

    // Traeremos los eventos en una ventana de 30 días desde hoy
    const now = new Date();
    const next30Days = addDays(now, 30);

    let whereClause: any = {
      isActive: true,
      status: "PUBLISHED",
      visibility: "PUBLIC",
      // El evento debe terminar después de ahora (es decir, el evento aún no termina o es futuro)
      endDate: {
        gte: now
      },
      // Y debe comenzar antes o exactamente dentro de los próximos 30 días
      startDate: {
        lte: next30Days
      }
    };

    if (ministerioId) {
      whereClause.ministerioId = ministerioId;
    }

    let take = limitParams ? parseInt(limitParams, 10) : undefined;
    if (take && isNaN(take)) {
      take = undefined; // ignorar si no es un numero valido
    }

    const eventos = await prisma.evento.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        location: true,
        mapLink: true,
        publicDescription: true,
        // ¡IMPORTANTE! NUNCA DEVOLVER privateNotes EN EL ENDPOINT PÚBLICO
        ministerio: {
          select: {
            id: true,
            name: true,
            color: true,
            logoUrl: true
          }
        }
      },
      orderBy: {
        startDate: "asc" // El más próximo a ocurrir primero
      },
      take: take
    });

    return NextResponse.json(eventos);
  } catch (error) {
    console.error("Error fetching public eventos:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
