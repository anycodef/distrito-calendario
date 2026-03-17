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
      where: { id: eventoId, isActive: true }
    });

    if (!eventoToUpdate) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    // Verificar si el creador es el mismo (solo Admin puede editar todo)
    if (eventoToUpdate.creatorId !== (payload as any).id as string && !(payload as any).roles.includes("ADMIN")) {
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
      where: { id: eventoId, isActive: true }
    });

    if (!eventoToDelete) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    // Verificar si el creador es el mismo (solo Admin puede borrar todo)
    if (eventoToDelete.creatorId !== (payload as any).id as string && !(payload as any).roles.includes("ADMIN")) {
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
