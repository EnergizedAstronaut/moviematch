"use client";

import Link from "next/link";
import { useState } from "react";

export default function Dashboard() {
  const [togethernessMode, setTogethernessMode] = useState(false);

  return (
    <div className="min-h-screen p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {/* ✨ Togetherness Mode Toggle */}
        <button
          onClick={() => setTogethernessMode(!togethernessMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition
            ${
              togethernessMode
                ? "bg-yellow-400 text-black border-yellow-300 shadow-lg shadow-yellow-400/30"
                : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
            }
          `}
        >
          <span className="text-lg">✨</span>
          <span className="text-sm font-medium">Togetherness Mode</span>
        </button>
      </header>

      {/* Optional banner */}
      {togethernessMode && (
        <div className="mb-6 rounded-lg bg-yellow-400/10 border border-yellow-300/30 p-3 text-sm text-yellow-300">
          ✨ Togetherness Mode is ON — prioritizing shared favorites
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Account (no auth yet) */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="font-bold text-lg mb-2">Your Account</h2>
          <p className="text-gray-300">Login not required (for now)</p>

          <Link
            href="/login"
            className="mt-4 inline-block px-4 py-2 bg-gray-700 rounded-lg"
          >
            Login (Coming Soon)
          </Link>
        </div>

        {/* Couple / Features */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="font-bold text-lg mb-2">Features</h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/movie"
              className="px-4 py-2 bg-red-600 rounded-lg"
            >
              Movie Search
            </Link>

            <Link
              href="/movie-night"
              className="px-4 py-2 bg-purple-600 rounded-lg"
            >
              Date Night Picker
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
