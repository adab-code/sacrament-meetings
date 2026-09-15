import { notFound } from "next/navigation";
import MeetingDetail from "@/components/MeetingDetail";
import { fetchMeetingById } from "@/lib/api";

export default async function MeetingPage(
  props: PageProps<"/meetings/[id]">
) {
  const { id } = await props.params;
  const meetingId = Number(id);

  if (!Number.isInteger(meetingId)) {
    notFound();
  }

  const meeting = await fetchMeetingById(meetingId);

  if (!meeting) {
    notFound();
  }

  return <MeetingDetail meeting={meeting} />;
}