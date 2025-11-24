import Message from "@/components/custom/Message/page";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full flex-col items-center justify-center py-8 px-4">
        <Message />
      </main>
    </div>
  );
}
