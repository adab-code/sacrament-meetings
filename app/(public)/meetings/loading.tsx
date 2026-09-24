// Estado de carga (Suspense) del segmento /meetings: esqueleto animado
// que se muestra mientras se resuelven los datos.
export default function MeetingsLoading() {
  return (
    <div
      aria-busy="true"
      className="motion-reduce:animate-none"
    >
      <div className="space-y-2">
        <div className="h-4 w-40 animate-pulse rounded-full bg-cream-300" />
        <div className="h-9 w-52 animate-pulse rounded-lg bg-cream-300" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-cream-200" />
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl border border-cream-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-32 rounded-full bg-cream-200" />
              <div className="h-6 w-16 rounded-full bg-cream-200" />
            </div>
            <div className="mt-4 h-7 w-2/3 rounded-lg bg-cream-200" />
            <div className="mt-3 space-y-2">
              <div className="h-3 w-full rounded-md bg-cream-200" />
              <div className="h-3 w-4/5 rounded-md bg-cream-200" />
            </div>
            <div className="mt-5 h-px bg-cream-200" />
            <div className="mt-4 flex items-center justify-between">
              <div className="h-3 w-28 rounded-full bg-cream-200" />
              <div className="h-4 w-20 rounded-md bg-cream-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}