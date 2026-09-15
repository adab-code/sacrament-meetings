import { headers } from "next/headers";
import type { SacramentMeeting } from "./types";

async function buildApiBaseUrl(): Promise<string> {
  const headerStore = await headers();
  const host =
    headerStore.get("x-forwarded-host") ??
    headerStore.get("host") ??
    "localhost:3000";
  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function fetchMeetings(
  date?: string
): Promise<SacramentMeeting[]> {
  const baseUrl = await buildApiBaseUrl();
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  const response = await fetch(`${baseUrl}/api/meetings${query}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `GET /api/meetings failed with status ${response.status}`
    );
  }

  return (await response.json()) as SacramentMeeting[];
}

export async function fetchMeetingById(
  id: number
): Promise<SacramentMeeting | null> {
  const baseUrl = await buildApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/meetings/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `GET /api/meetings/${id} failed with status ${response.status}`
    );
  }

  return (await response.json()) as SacramentMeeting;
}