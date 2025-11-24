import Message from "@/components/custom/Message/page";

export default async function Chat({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="flex h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="flex h-full w-full flex-col px-4 py-4">
        <Message chatId={id} />
      </main>
    </div>
  );
}
