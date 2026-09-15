import MeetingsNav from "@/components/MeetingsNav";

export default function MeetingsLayout(props: LayoutProps<"/meetings">) {
  return (
    <main className="flex w-full flex-1 flex-col items-center py-8">
      <section className="w-full max-w-4xl px-5">
        <MeetingsNav />
        {props.children}
      </section>
    </main>
  );
}