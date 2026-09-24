// GET /api/meetings/[id]
// Detalle de una reunión: 400 si el id es inválido, 404 si no existe.
import { getMeetingById } from "@/lib/meetings-db";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/meetings/[id]">
) {
  const { id } = await ctx.params;
  const meetingId = Number(id);

  if (!Number.isInteger(meetingId)) {
    return Response.json({ error: "Invalid meeting id" }, { status: 400 });
  }

  const meeting = await getMeetingById(meetingId);

  if (!meeting) {
    return Response.json({ error: "Meeting not found" }, { status: 404 });
  }

  return Response.json(meeting);
}