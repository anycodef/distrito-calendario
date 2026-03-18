import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/auth/session";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const payload = await decrypt(sessionCookie);
    if (!payload || (!(payload as any).roles.includes("LIDER") && !(payload as any).roles.includes("SUPERVISOR"))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const resolvedParams = await params;
    const eventoId = Array.isArray(resolvedParams.id) ? resolvedParams.id[0] : resolvedParams.id;

    const eventoToUpdate = await prisma.evento.findUnique({
      where: { id: eventoId, isActive: true },
      include: { ministerio: true }
    });

    if (!eventoToUpdate) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    let isAuthorized = false;

    // Admin puede editar todo
    if ((payload as any).roles.includes("ADMIN")) {
        isAuthorized = true;
    }
    // Si el evento es del Distrito, CUALQUIER SUPERVISOR puede editarlo
    else if (eventoToUpdate.ministerio?.name.includes("Distrito") && (payload as any).roles.includes("SUPERVISOR")) {
        isAuthorized = true;
    }
    // O si el usuario activo actualmente lidera el ministerio al que pertenece este evento
    else {
        const isLider = await prisma.ministerio.findFirst({
            where: {
                id: eventoToUpdate.ministerioId,
                lideresActivos: { some: { id: (payload as any).id as string } }
            }
        });
        if (isLider) isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "No tienes permisos para editar este evento" }, { status: 403 });
    }

    const body = await request.json();
    const { title, ministerioId, startDate, endDate, location, mapLink, publicDescription, privateNotes, status, visibility } = body;

    const updatedEvento = await prisma.evento.update({
      where: { id: eventoId },
      data: {
        title,
        ministerioId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        location,
        mapLink,
        publicDescription,
        privateNotes,
        status,
        visibility
      }
    });

    return NextResponse.json(updatedEvento);
  } catch (error) {
    console.error("Error updating evento:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const payload = await decrypt(sessionCookie);
    if (!payload || (!(payload as any).roles.includes("LIDER") && !(payload as any).roles.includes("SUPERVISOR"))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const resolvedParams = await params;
    const eventoId = Array.isArray(resolvedParams.id) ? resolvedParams.id[0] : resolvedParams.id;

    const eventoToDelete = await prisma.evento.findUnique({
      where: { id: eventoId, isActive: true },
      include: { ministerio: true }
    });

    if (!eventoToDelete) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    let isAuthorized = false;

    // Admin puede borrar todo
    if ((payload as any).roles.includes("ADMIN")) {
        isAuthorized = true;
    }
    // Supervisor puede borrar eventos de Distrito
    else if (eventoToDelete.ministerio?.name.includes("Distrito") && (payload as any).roles.includes("SUPERVISOR")) {
        isAuthorized = true;
    }
    // O si el usuario actualmente lidera el ministerio del evento
    else {
        const isLider = await prisma.ministerio.findFirst({
            where: {
                id: eventoToDelete.ministerioId,
                lideresActivos: { some: { id: (payload as any).id as string } }
            }
        });
        if (isLider) isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "No tienes permisos para eliminar este evento" }, { status: 403 });
    }

    // Soft delete
    const deletedEvento = await prisma.evento.update({
      where: { id: eventoId },
      data: { isActive: false }
    });

    return NextResponse.json(deletedEvento);
  } catch (error) {
    console.error("Error deleting evento:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
