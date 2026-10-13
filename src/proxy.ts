import { NextResponse, type NextRequest } from "next/server";
import { requireManagementAccess } from "@/server/management-access";

export async function proxy(request: NextRequest) {
  return (await requireManagementAccess(request, false)) ?? NextResponse.next();
}

export const config = { matcher: ["/manage-offerings/:path*"] };
