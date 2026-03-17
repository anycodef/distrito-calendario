import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET_KEY || "secret-key-development-only";
const encodedKey = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")?.value;

  // Si intenta acceder al dashboard pero no tiene sesión, va a login
  if (!sessionCookie && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    if (sessionCookie) {
      const { payload } = await jwtVerify(sessionCookie, encodedKey, {
        algorithms: ["HS256"],
      });

      // Protecciones de Roles
      if (request.nextUrl.pathname.startsWith("/dashboard/admin") && payload.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      if (request.nextUrl.pathname.startsWith("/dashboard/supervisor") && payload.role !== "SUPERVISOR") {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      if (request.nextUrl.pathname.startsWith("/dashboard/lider") && payload.role !== "LIDER") {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // Si tiene sesión y va a /login o la raíz, redirigirlo a su respectivo dashboard
      if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/") {
        if (payload.role === "ADMIN") return NextResponse.redirect(new URL("/dashboard/admin", request.url));
        if (payload.role === "SUPERVISOR") return NextResponse.redirect(new URL("/dashboard/supervisor", request.url));
        if (payload.role === "LIDER") return NextResponse.redirect(new URL("/dashboard/lider", request.url));
      }
    }
  } catch (error) {
    // Sesión inválida o expirada
    request.cookies.delete("session");
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/"],
};
