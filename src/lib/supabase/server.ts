import { cookies } from "next/headers";
import { createRouteHandlerClient as createClient } from "@supabase/auth-helpers-nextjs";

export function createRouteHandlerClient() {
  const cookieStore = cookies(); 
  return createClient({ cookies: () => cookieStore });
}
