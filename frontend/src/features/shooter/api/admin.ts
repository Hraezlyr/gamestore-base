import { requestJson } from "./http";

export async function checkAdminAccess(accessToken: string): Promise<void> {
  await requestJson("/admin/games/?page_size=1", { headers: { Authorization: `Bearer ${accessToken}` } });
}
