// Botón de borrado de una reunión, con confirmación en dos pasos.
//
// Es un Client Component sólo por el paso de confirmación (useState). El
// borrado real lo hace el Server Action deleteMeeting enlazado con .bind, de
// forma que el formulario también funciona sin JavaScript.
//
// El aviso de confirmación es un role="alert" para que un lector de pantalla
// anuncie la pregunta en cuanto aparece, sin tener que recorrer la tarjeta.
"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteMeeting } from "@/lib/actions";

function formatMeetingDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function DeleteSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-red-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Deleting…" : "Yes, delete"}
    </button>
  );
}

interface DeleteMeetingButtonProps {
  id: number;
  date: string;
}

export default function DeleteMeetingButton({
  id,
  date,
}: DeleteMeetingButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const formattedDate = formatMeetingDate(date);

  return (
    // relative z-10 mantiene el control pulsable por encima del enlace que
    // cubre la tarjeta entera (patrón de "stretched link").
    <div className="relative z-10">
      {!isConfirming ? (
        <button
          type="button"
          onClick={() => setIsConfirming(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-cream-200 px-4 py-2 text-xs font-semibold text-ink-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-800"
        >
          Delete
          <span className="sr-only"> the {formattedDate} meeting</span>
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <p
            role="alert"
            className="text-xs font-medium text-red-800"
          >{`Delete the ${formattedDate} meeting? This cannot be undone.`}</p>
          <form action={deleteMeeting.bind(null, id)}>
            <DeleteSubmitButton />
          </form>
          <button
            type="button"
            onClick={() => setIsConfirming(false)}
            className="rounded-full border border-cream-200 px-4 py-2 text-xs font-semibold text-navy-900 transition hover:bg-cream-100"
          >
            Cancel
            <span className="sr-only"> deleting the {formattedDate} meeting</span>
          </button>
        </div>
      )}
    </div>
  );
}