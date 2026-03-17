import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth/session";

export async function GET() {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    const payload = await decrypt(sessionCookie);

    if (!payload) {
      return NextResponse.json({ message: "Sesión inválida" }, { status: 401 });
    }

    return NextResponse.json({
      id: payload.id,
      name: payload.name,
      roles: payload.roles || []
    });
  } catch (error) {
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
