// Placeholder de "Editar reunión" — el formulario real llega en la Semana 04.
// Recibe el id desde el segmento dinámico de la URL.
export default async function EditMeetingPage(
  props: PageProps<"/meetings/[id]/edit">
) {
  const { id } = await props.params;

  return (
    <div className="rounded-2xl border border-dashed border-cream-300 bg-cream-50 px-6 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-700">
        Admin
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-navy-900">
        Edit Meeting &mdash; Coming in Week 04
      </h1>
      <p className="mt-3 text-ink-700">
        The form to edit meeting #{id} will live here.
      </p>
    </div>
  );
}