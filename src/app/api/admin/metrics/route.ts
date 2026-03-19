import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth/session";

export async function GET() {
  const sessionCookie = (await cookies()).get("session")?.value;
  if (!sessionCookie) return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  const payload = await decrypt(sessionCookie);
  if (!payload || !(payload as any).roles.includes("ADMIN")) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const [totalUsers, activeMinistries, totalChurches] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.ministerio.count({ where: { isActive: true } }),
      prisma.iglesia.count({ where: { isActive: true } })
    ]);

    return NextResponse.json({ totalUsers, activeMinistries, totalChurches });
  } catch (error) {
    console.error("Error fetching admin metrics:", error);
    return NextResponse.json({ message: "Error al obtener métricas" }, { status: 500 });
  }
}
