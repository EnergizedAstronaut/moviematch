import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-4xl font-bold">🎬 MovieMatch</h1>
      <p className="text-gray-300">Compare tastes & find the perfect date-night movie.</p>
      <div className="flex gap-4">
        <Link href="/auth/login" className="px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700">
          Login
        </Link>
        <Link href="/dashboard" className="px-6 py-3 bg-gray-800 rounded-lg hover:bg-gray-700">
          Dashboard
        </Link>
      </div>
    </main>
  );
}
