"use client";

import { signOut } from "next-auth/react";

export default function Logout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-4">Logout</h1>
      <button
        onClick={() => signOut()}
        className="px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700"
      >
        Sign out
      </button>
    </div>
  );
}
