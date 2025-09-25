"use server";

import { redirect } from "next/navigation";
import Link from "next/link";
import { LoginForm } from "~/components/login-form";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export default async function Page() {
  const session = await auth();

  if (session?.user?.id) {
    // Kullanıcının veritabanında var olup olmadığını kontrol et
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (user) {
      redirect("/dashboard");
    }
    // Eğer kullanıcı veritabanında yoksa, session'ı temizle ve login sayfasını göster
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 via-pink-900 via-purple-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      {/* Header */}
      <header className="sticky top-0 z-50 animate-fade-in-up border-b border-white/20 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            href="/"
            className="group flex items-center space-x-2 transition-all duration-300 hover:scale-105"
          >
            <div className="relative font-sans text-xl font-medium tracking-tight">
              <span className="text-white transition-colors duration-300 group-hover:text-blue-400">
                resonora
              </span>
              <span className="font-light text-white/70 transition-colors duration-300 group-hover:text-blue-300">
                .
              </span>
              <span className="animate-gradient font-light text-white transition-all duration-500 group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:via-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text group-hover:text-transparent">
                ai
              </span>
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-20"></div>
            </div>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-sm text-white/80 hover:text-white transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 animate-fade-in-up">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Welcome Back! 👋
            </h1>
            <p className="text-xl text-white/80">
              Sign in to continue creating amazing clips
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-8 shadow-2xl">
            <LoginForm />
          </div>
        </div>
      </main>
    </div>
  );
}
