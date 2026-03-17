import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { name, color, categoriaId, liderId, isActive } = await req.json();
    const params = await context.params;
    const id = params.id;

    // 1. Obtener el ministerio actual y su líder actual para detectar cambios
    const ministerioActual = await prisma.ministerio.findUnique({
      where: { id },
      include: { lideresActivos: true }
    });

    if (!ministerioActual) {
      return NextResponse.json({ message: "Ministerio no encontrado" }, { status: 404 });
    }

    // Simplificación para Sprint 2: Si bien N:M permite varios, la UI de Admin asignará un "Líder Principal" para este ministerio.
    // Veremos si hay un nuevo líder que se está asignando
    const liderActualId = ministerioActual.lideresActivos[0]?.id; // Tomamos el primer líder para gestionar el historial simple de reemplazo

    let isNewLider = false;
    if (liderId && liderId !== liderActualId) {
       isNewLider = true;
    } else if (liderActualId && !liderId) {
       // El admin destituyó al líder sin poner uno nuevo
       isNewLider = true;
    }

    // Actualizamos los datos básicos y conectamos/desconectamos al líder
    const lideresToConnect = liderId ? [{ id: liderId }] : [];

    // Si hubo un cambio de líder (asignación o destitución), actualizar historial
    if (isNewLider && liderActualId) {
       // Cerrar historial del líder anterior para este ministerio específico
       await prisma.historialLider.updateMany({
         where: { ministerioId: id, userId: liderActualId, endDate: null },
         data: { endDate: new Date() }
       });

       // LÓGICA DE NEGOCIO OBLIGATORIA: ¿Este líder se quedó sin ministerios?
       // Como lo estamos desconectando, contamos si tiene otros ministerios ACTIVOS.
       // (Excluimos este ministerio porque ya no es de él).
       const otherMinistries = await prisma.ministerio.count({
          where: {
            lideresActivos: { some: { id: liderActualId } },
            id: { not: id }
          }
       });

       // Si no le quedan ministerios, inhabilitamos sus credenciales
       if (otherMinistries === 0) {
          await prisma.user.update({
            where: { id: liderActualId },
            data: { isActive: false }
          });
       }
    }

    // Actualizar el ministerio y establecer su nuevo array de líderes activos (Reemplazará el anterior)
    const ministerioUpdate = await prisma.ministerio.update({
      where: { id },
      data: {
        name,
        color,
        categoriaId,
        isActive,
        lideresActivos: {
          set: lideresToConnect // Set pisa todos los existentes
        }
      }
    });

    // Si hay un NUEVO líder, abrirle historial
    if (isNewLider && liderId) {
       await prisma.historialLider.create({
         data: {
           ministerioId: id,
           userId: liderId,
           startDate: new Date()
         }
       });

       // Reactivar su cuenta si estaba inhabilitada
       await prisma.user.update({
         where: { id: liderId },
         data: { isActive: true }
       });
    }

    return NextResponse.json(ministerioUpdate);
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ message: "El nombre ya existe" }, { status: 400 });
    return NextResponse.json({ message: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params.id;
    // Hard delete
    await prisma.ministerio.delete({ where: { id } });
    return NextResponse.json({ message: "Eliminado con éxito" });
  } catch (error) {
    return NextResponse.json({ message: "Error al eliminar. Verifique que no tenga eventos o historiales dependientes." }, { status: 500 });
  }
}
