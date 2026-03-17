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

    const eventos = await prisma.evento.findMany({
      where: {
        isActive: true,
        status: "PUBLISHED"
      },
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

    return NextResponse.json(eventos);
  } catch (error) {
    console.error("Error fetching all published eventos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const payload = await decrypt(sessionCookie);
    if (!payload || (!(payload as any).roles.includes("LIDER") && !(payload as any).roles.includes("SUPERVISOR"))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { title, ministerioId, startDate, endDate, location, mapLink, publicDescription, privateNotes, status, visibility } = body;

    if (!title || !ministerioId || !startDate || !endDate) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // Verificar que el usuario tenga asignado el ministerio o sea supervisor del ministerio
    const ministerio = await prisma.ministerio.findFirst({
        where: {
            id: ministerioId,
            lideresActivos: {
                some: { id: (payload as any).id as string }
            }
        }
    });

    if (!ministerio && !(payload as any).roles.includes("SUPERVISOR")) {
        // En un caso real el Supervisor podría tener acceso a todo si se configuran así los permisos,
        // pero por ahora el supervisor debe tener asignado el ministerio "Distrito 3" explícitamente.
        // Asumiendo que el requerimiento es que el usuario debe ser líder activo de ese ministerio:
        return NextResponse.json({ error: "No tienes permiso para crear eventos en este ministerio" }, { status: 403 });
    }

    const newEvento = await prisma.evento.create({
      data: {
        title,
        ministerioId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location: location || null,
        mapLink: mapLink || null,
        publicDescription: publicDescription || null,
        privateNotes: privateNotes || null,
        status: status || "PUBLISHED",
        visibility: visibility || "PUBLIC",
        creatorId: (payload as any).id as string
      }
    });

    return NextResponse.json(newEvento, { status: 201 });
  } catch (error) {
    console.error("Error creating evento:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
