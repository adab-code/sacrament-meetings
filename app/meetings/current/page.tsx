import { redirect } from "next/navigation";
import { fetchMeetings } from "@/lib/api";
import { toISODate } from "@/lib/meetings-db";

export default async function CurrentMeetingPage() {
  const today = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());

  const meetings = await fetchMeetings(toISODate(sunday));
  const current = meetings[0];

  redirect(current ? `/meetings/${current.id}` : "/meetings");
}