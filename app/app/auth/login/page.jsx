"use client";

import { signIn } from "next-auth/react";

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-4">Login</h1>
      <button
        onClick={() => signIn("github")}
        className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        Sign in with GitHub
      </button>
    </div>
  );
}
