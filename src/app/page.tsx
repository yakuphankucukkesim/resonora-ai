"use server";

import Link from "next/link";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { Button } from "~/components/ui/button";
import {
  Card,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { DashboardClient } from "~/components/dashboard-client";
import { Toaster } from "~/components/ui/sonner";

export default async function HomePage() {
  const session = await auth();
  let user = null;
  let userData = null;

  // Eğer kullanıcı giriş yapmışsa kullanıcı bilgilerini al
  if (session?.user?.id) {
    user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (user) {
      userData = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
          uploadedFiles: {
            where: {
              uploaded: true,
            },
            select: {
              id: true,
              s3Key: true,
              displayName: true,
              status: true,
              createdAt: true,
              _count: {
                select: {
                  clips: true,
                },
              },
            },
          },
          clips: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });
    }
  }

  const formattedFiles =
    userData?.uploadedFiles.map((file) => ({
      id: file.id,
      s3Key: file.s3Key,
      filename: file.displayName ?? "Unknown filename",
      status: file.status,
      clipsCount: file._count.clips,
      createdAt: file.createdAt,
    })) ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 via-pink-900 via-purple-900 to-slate-900">
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

          {user ? (
            <div className="flex items-center space-x-4">
              <Badge
                variant="secondary"
                className="h-8 animate-pulse border-green-400/30 bg-green-500/20 px-4 py-1.5 text-sm font-medium text-green-200"
              >
                💎 {user.credits} credits
              </Badge>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="btn-animate border-white/30 bg-white/10 text-white hover:border-white/50 hover:bg-white/20"
              >
                <Link href="/dashboard/billing">💳 Buy Credits</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="btn-animate text-white hover:bg-red-500/20 hover:text-red-300"
              >
                <Link href="/api/auth/signout?callbackUrl=/">🚪 Sign Out</Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Button
                size="lg"
                asChild
                className="btn-animate text-m animate-shake rounded-xl border-0 bg-white px-8 py-4 font-semibold text-slate-900 shadow-2xl hover:bg-white/90"
              >
                <Link href="/login">Sign In</Link>
              </Button>
              <Button
                size="lg"
                asChild
                className="btn-animate animate-shake rounded-xl border-0 bg-white px-8 py-4 text-lg font-semibold text-slate-900 shadow-2xl hover:bg-white/90"
              >
                <Link href="/signup">Get Started!</Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      <main>
        {user ? (
          // Giriş yapmış kullanıcılar için dashboard içeriği
          <div className="container mx-auto max-w-6xl">
            <DashboardClient
              uploadedFiles={formattedFiles}
              clips={userData?.clips ?? []}
            />
          </div>
        ) : (
          // Giriş yapmamış kullanıcılar için landing page
          <>
            {/* Hero Section */}
            <section className="relative overflow-hidden py-32 md:py-40">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
              <div className="container relative z-10 mx-auto px-4">
                <div className="mx-auto max-w-6xl text-center">
                  <div className="mb-8 inline-flex animate-fade-in-up items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
                    <span className="text-sm font-medium text-white/90">
                      🤖 AI-Powered Podcast Clipping 🤖
                    </span>
                  </div>
                  <h1 className="animation-delay-200 mb-8 animate-fade-in-up text-6xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl">
                    The most realistic
                    <br />
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      podcast clipper
                    </span>
                  </h1>
                  <p className="animation-delay-400 mx-auto mb-12 max-w-4xl animate-fade-in-up text-2xl leading-relaxed text-white/80 sm:text-3xl lg:text-4xl">
                    AI-powered tool that instantly clips your podcasts and adds
                    subtitles — ready to share on any platform.
                  </p>
                  <div className="animation-delay-600 flex animate-fade-in-up flex-col items-center justify-center gap-6 sm:flex-row">
                    <Button
                      size="lg"
                      asChild
                      className="btn-animate animate-shake rounded-xl border-0 bg-white px-8 py-4 text-lg font-semibold text-slate-900 shadow-2xl hover:bg-white/90"
                    >
                      <Link href="/signup">Get started free!</Link>
                    </Button>
                  </div>
                  <div className="animation-delay-800 mt-16 animate-fade-in-up text-sm text-white/60">
                    Trusted by leading podcasters and creators worldwide
                  </div>
                </div>
              </div>
            </section>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center">
                <div className="bg-slate-900 px-4">
                  <div className="h-2 w-2 rounded-full bg-white/20"></div>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <section id="features" className="py-32">
              <div className="container mx-auto px-4">
                <div className="mx-auto max-w-6xl">
                  <div className="mb-20 animate-fade-in-up text-center">
                    <div className="relative mb-8 font-sans text-6xl font-medium tracking-tight">
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
                    <p className="mx-auto max-w-3xl text-xl text-white/80">
                      Turn your podcasts into viral clips with AI — cut
                      highlights and add subtitles in seconds.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="animation-delay-200 group relative animate-fade-in-up cursor-pointer overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-8 shadow-sm backdrop-blur-sm transition-all duration-500 hover:-translate-y-3 hover:scale-105 hover:shadow-2xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                      <div className="relative z-10">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg transition-all duration-500 group-hover:scale-125 group-hover:animate-pulse">
                          <svg
                            className="h-8 w-8 text-white transition-transform duration-500 group-hover:rotate-12"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                          </svg>
                        </div>
                        <h3 className="mb-4 text-center text-2xl font-bold text-white transition-all duration-500 group-hover:scale-110 group-hover:animate-pulse group-hover:text-blue-400">
                          AI-Powered Detection
                        </h3>
                        <p className="text-center leading-relaxed text-white/80 transition-all duration-500 group-hover:scale-105 group-hover:text-white">
                          Our advanced AI automatically identifies the most
                          engaging moments and viral-worthy segments from your
                          podcast
                        </p>
                        <div className="mt-4 flex justify-center">
                          <div className="h-1 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                        </div>
                      </div>
                    </Card>

                    <Card className="animation-delay-400 group relative animate-fade-in-up cursor-pointer overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-8 shadow-sm backdrop-blur-sm transition-all duration-500 hover:-translate-y-3 hover:scale-105 hover:shadow-2xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                      <div className="relative z-10">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg transition-all duration-500 group-hover:scale-125 group-hover:animate-pulse">
                          <svg
                            className="h-8 w-8 text-white transition-transform duration-500 group-hover:-rotate-12"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        </div>
                        <h3 className="mb-4 text-center text-2xl font-bold text-white transition-all duration-500 group-hover:scale-110 group-hover:animate-pulse group-hover:text-green-400">
                          Lightning Fast
                        </h3>
                        <p className="text-center leading-relaxed text-white/80 transition-all duration-500 group-hover:scale-105 group-hover:text-white">
                          Process hours of podcast content in minutes. Get your
                          clips ready for social media instantly
                        </p>
                        <div className="mt-4 flex justify-center">
                          <div className="h-1 w-12 rounded-full bg-gradient-to-r from-green-500 to-blue-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                        </div>
                      </div>
                    </Card>

                    <Card className="animation-delay-600 group relative animate-fade-in-up cursor-pointer overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-8 shadow-sm backdrop-blur-sm transition-all duration-500 hover:-translate-y-3 hover:scale-105 hover:shadow-2xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                      <div className="relative z-10">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg transition-all duration-500 group-hover:scale-125 group-hover:animate-pulse">
                          <svg
                            className="h-8 w-8 text-white transition-transform duration-500 group-hover:rotate-12"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12h6m-6 4h6"
                            />
                          </svg>
                        </div>
                        <h3 className="mb-4 text-center text-2xl font-bold text-white transition-all duration-500 group-hover:scale-110 group-hover:animate-pulse group-hover:text-purple-400">
                          Multiple Formats
                        </h3>
                        <p className="text-center leading-relaxed text-white/80 transition-all duration-500 group-hover:scale-105 group-hover:text-white">
                          Export your clips in various formats optimized for
                          Instagram, TikTok, YouTube Shorts, and more
                        </p>
                        <div className="mt-4 flex justify-center">
                          <div className="h-1 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </section>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center">
                <div className="bg-slate-900 px-4">
                  <div className="h-2 w-2 rounded-full bg-white/20"></div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <section className="py-32">
              <div className="container mx-auto px-4">
                <div className="mx-auto max-w-6xl">
                  <div className="mb-20 text-center">
                    <h2 className="mb-8 text-5xl font-bold text-white sm:text-6xl">
                      🎙️ Why Choose Our AI Clipper?
                    </h2>
                    <p className="mx-auto max-w-4xl text-xl leading-relaxed text-white/80">
                      Stop spending hours manually editing your podcasts. Our AI
                      does the heavy lifting, automatically finding the most
                      engaging moments and turning them into viral-ready clips
                      with perfect subtitles.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl border border-white/20 bg-white/10 p-8 text-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                      <div className="mb-6 text-6xl">⚡</div>
                      <h3 className="mb-4 text-2xl font-bold text-white">
                        Lightning Fast
                      </h3>
                      <p className="leading-relaxed text-white/80">
                        Process 2-hour podcasts in under 5 minutes. Get your
                        clips ready for social media instantly.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/20 bg-white/10 p-8 text-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                      <div className="mb-6 text-6xl">🧠</div>
                      <h3 className="mb-4 text-2xl font-bold text-white">
                        AI-Powered
                      </h3>
                      <p className="leading-relaxed text-white/80">
                        Advanced machine learning identifies the most
                        viral-worthy moments automatically. No manual work
                        needed.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/20 bg-white/10 p-8 text-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                      <div className="mb-6 text-6xl">📱</div>
                      <h3 className="mb-4 text-2xl font-bold text-white">
                        Multi-Platform
                      </h3>
                      <p className="leading-relaxed text-white/80">
                        Export clips optimized for Instagram, TikTok, YouTube
                        Shorts, Twitter, and LinkedIn in one click.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center">
                <div className="bg-slate-900 px-4">
                  <div className="h-2 w-2 rounded-full bg-white/20"></div>
                </div>
              </div>
            </div>

            {/* Testimonials Section */}
            <section className="py-32">
              <div className="container mx-auto px-4">
                <div className="mx-auto max-w-6xl">
                  <div className="mb-20 text-center">
                    <h2 className="mb-8 text-5xl font-bold text-white sm:text-6xl">
                      🎯 What Our Users Say
                    </h2>
                    <p className="mx-auto max-w-3xl text-xl text-white/80">
                      Join thousands of podcasters who&apos;ve transformed their
                      content with our AI clipper
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:bg-white/20">
                      <div className="mb-6 text-6xl">🎙️</div>
                      <h3 className="mb-4 text-xl font-bold text-white">
                        Sarah Chen
                      </h3>
                      <p className="mb-4 text-sm font-medium text-white/80">
                        Tech Podcast Host
                      </p>
                      <p className="italic leading-relaxed text-white/90">
                        &ldquo;This tool saved me 10+ hours per week! My clips now get
                        3x more engagement on social media. The AI perfectly
                        captures the most interesting parts.&ldquo;
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:bg-white/20">
                      <div className="mb-6 text-6xl">🚀</div>
                      <h3 className="mb-4 text-xl font-bold text-white">
                        Marcus Johnson
                      </h3>
                      <p className="mb-4 text-sm font-medium text-white/80">
                        Business Coach
                      </p>
                      <p className="italic leading-relaxed text-white/90">
                        &ldquo;I went from 500 to 50K followers in 3 months thanks to
                        these viral clips. The automatic subtitles are a
                        game-changer for accessibility.&ldquo;
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:bg-white/20">
                      <div className="mb-6 text-6xl">💡</div>
                      <h3 className="mb-4 text-xl font-bold text-white">
                        Alex Rivera
                      </h3>
                      <p className="mb-4 text-sm font-medium text-white/80">
                        Educational Content Creator
                      </p>
                      <p className="italic leading-relaxed text-white/90">
                        &ldquo;The AI understands context so well. It finds the
                        perfect 30-second clips that actually make sense and
                        drive engagement. Incredible technology!&ldquo;
                      </p>
                    </div>
                  </div>

                  <div className="mt-16 text-center">
                    <div className="inline-flex items-center space-x-2 text-white/60">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">
                          10K+
                        </div>
                        <div className="text-sm">Active Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">1M+</div>
                        <div className="text-sm">Clips Generated</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">95%</div>
                        <div className="text-sm">User Satisfaction</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="animation-delay-800 animate-fade-in-up border-t border-white/20 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="flex items-center space-x-2 transition-transform duration-200 hover:scale-105">
              <div className="font-sans text-lg font-medium tracking-tight">
                <span className="text-white">resonora</span>
                <span className="font-light text-white/70">.</span>
                <span className="animate-gradient font-light text-white">
                  ai
                </span>
              </div>
            </div>
            <p className="animation-delay-1000 animate-fade-in-up text-sm text-white/60">
              © 2025 Resonora.ai. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}
