"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "../../lib/supabaseClient";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [couple, setCouple] = useState(null);
  const [premium, setPremium] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;

    const load = async () => {
      const { data } = await supabase
        .from("couples")
        .select("*")
        .eq("owner_id", session.user.id)
        .single();

      setCouple(data);

      const { data: user } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("id", session.user.id)
        .single();

      setPremium(user?.is_premium || false);
    };

    load();
  }, [status, session]);

  if (status === "loading") return <p className="p-6">Loading...</p>;
  if (!session) return <p className="p-6">Not logged in</p>;

  return (
    <div className="min-h-screen p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/auth/logout" className="px-4 py-2 bg-gray-800 rounded-lg">
          Logout
        </Link>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="font-bold text-lg mb-2">Your Account</h2>
          <p className="text-gray-300">Name: {session.user.name}</p>
          <p className="text-gray-300">Email: {session.user.email}</p>
          <p className="text-gray-300">Premium: {premium ? "Yes" : "No"}</p>
          <Link href="/settings" className="mt-4 inline-block px-4 py-2 bg-yellow-500 text-black rounded-lg">
            Manage Subscription
          </Link>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="font-bold text-lg mb-2">Couple</h2>
          {couple ? (
            <>
              <p className="text-gray-300">Partner: {couple.partner_email}</p>
              <p className="text-gray-300 break-all">Join link: {couple.join_link}</p>
              <div className="mt-4 flex gap-3">
                <Link href="/movie" className="px-4 py-2 bg-red-600 rounded-lg">Movie Search</Link>
                <Link href="/date-night" className="px-4 py-2 bg-purple-600 rounded-lg">Date Night Picker</Link>
              </div>
            </>
          ) : (
            <p className="text-gray-300">
              No couple yet. <Link href="/couple" className="text-yellow-400">Create invite</Link>
            </p>
          )}
        </div>
      </div>

      {session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
        <div className="mt-8 bg-gray-800 rounded-xl p-6">
          <h2 className="font-bold text-lg">Admin</h2>
          <Link href="/admin" className="mt-2 inline-block px-4 py-2 bg-blue-600 rounded-lg">
            Admin Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
