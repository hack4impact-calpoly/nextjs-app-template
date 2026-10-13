import { toErrorEnvelope } from "@/lib/offerings";

/** Shared by Node route handlers, the server page, and proxy. Credentials never enter client code. */
export async function hasManagementAccess(authorization: string | null): Promise<boolean> {
  const username = process.env.MANAGEMENT_USERNAME;
  const password = process.env.MANAGEMENT_PASSWORD;
  if (
    !username ||
    username.includes(":") ||
    !password ||
    password.length < 16 ||
    /[{}<>]|CHANGE_ME|replace-with/i.test(password) ||
    !authorization
  )
    return false;
  const encode = new TextEncoder();
  const expected = `Basic ${btoa(String.fromCharCode(...encode.encode(`${username}:${password}`)))}`;
  const [actualHash, expectedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encode.encode(authorization)),
    crypto.subtle.digest("SHA-256", encode.encode(expected)),
  ]);
  const actual = new Uint8Array(actualHash);
  const expectedBytes = new Uint8Array(expectedHash);
  let difference = 0;
  for (let index = 0; index < actual.length; index++) difference |= actual[index] ^ expectedBytes[index];
  return difference === 0;
}

export async function requireManagementAccess(request: Request, checkOrigin = true): Promise<Response | null> {
  if (!(await hasManagementAccess(request.headers.get("authorization")))) {
    return Response.json(toErrorEnvelope("UNAUTHORIZED", "Team sign-in is required to manage offerings."), {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Coffee Shop management", charset="UTF-8"',
        "Cache-Control": "no-store",
      },
    });
  }
  const origin = request.headers.get("origin");
  const requestUrl = new URL(request.url);
  // Next.js can normalize the internal URL hostname. Host retains the browser's target.
  const expectedOrigin = `${requestUrl.protocol}//${request.headers.get("host") ?? requestUrl.host}`;
  if (checkOrigin && origin && origin !== expectedOrigin) {
    return Response.json(toErrorEnvelope("FORBIDDEN", "Use the shop's management page to make changes."), {
      status: 403,
      headers: { "Cache-Control": "no-store" },
    });
  }
  return null;
}
