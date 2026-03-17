import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET_KEY || "secret-key-development-only";
const encodedKey = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")?.value;

  // Si intenta acceder al dashboard o la API de admin pero no tiene sesión
  if (!sessionCookie) {
    if (request.nextUrl.pathname.startsWith("/api/admin")) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  try {
    if (sessionCookie) {
      const { payload } = await jwtVerify(sessionCookie, encodedKey, {
        algorithms: ["HS256"],
      });

      const roles = (payload.roles as string[]) || [];

      // Protecciones de Roles (Dashboard)
      if (request.nextUrl.pathname.startsWith("/dashboard/admin") && !roles.includes("ADMIN")) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      if (request.nextUrl.pathname.startsWith("/dashboard/supervisor") && !roles.includes("SUPERVISOR")) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      if (request.nextUrl.pathname.startsWith("/dashboard/lider") && !roles.includes("LIDER")) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // Protección estricta para API Admin
      if (request.nextUrl.pathname.startsWith("/api/admin") && !roles.includes("ADMIN")) {
        return NextResponse.json({ message: "Acceso no autorizado" }, { status: 403 });
      }

      // Si tiene sesión y va a /login o la raíz, redirigirlo al de mayor jerarquía que posea
      if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/") {
        if (roles.includes("ADMIN")) return NextResponse.redirect(new URL("/dashboard/admin", request.url));
        if (roles.includes("SUPERVISOR")) return NextResponse.redirect(new URL("/dashboard/supervisor", request.url));
        if (roles.includes("LIDER")) return NextResponse.redirect(new URL("/dashboard/lider", request.url));
      }
    }
  } catch (error) {
    // Sesión inválida o expirada
    request.cookies.delete("session");
    if (request.nextUrl.pathname.startsWith("/api/admin")) {
      return NextResponse.json({ message: "Sesión inválida" }, { status: 401 });
    }
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/", "/api/admin/:path*"],
};
