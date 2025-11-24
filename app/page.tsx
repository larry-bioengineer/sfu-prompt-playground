"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Generate a random ID
    const randomId = crypto.randomUUID();
    // Navigate to the chat page with the random ID
    router.push(`/chat/${randomId}`);
  }, [router]);

  return (
    <div className="flex h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="flex h-full w-full flex-col items-center justify-center px-4 py-4">
        <div className="text-zinc-600 dark:text-zinc-400">Redirecting to chat...</div>
      </main>
    </div>
  );
}
