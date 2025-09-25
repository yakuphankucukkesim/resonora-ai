"use client";

import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { signOut } from "next-auth/react";

const NavHeader = ({ credits, email }: { credits: number; email: string }) => {
  return (
    <header className="sticky top-0 z-50 animate-fade-in-up border-b border-white/20 bg-slate-900/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/dashboard"
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

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="h-8 px-3 py-1.5 text-xs font-medium bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              ⭐ {credits} credits
            </Badge>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 text-xs font-medium border-white/30 bg-white/10 text-white hover:border-white/50 hover:bg-white/20"
            >
              <Link href="/dashboard/billing">Buy more credits</Link>
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full p-0 hover:bg-white/10"
              >
                <Avatar>
                  <AvatarFallback className="bg-white/10 text-white border border-white/20">{email.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800/95 backdrop-blur-md border-white/20">
              <DropdownMenuLabel>
                <p className="text-xs text-white/70">{email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/20" />
              <DropdownMenuItem asChild className="text-white hover:bg-white/10">
                <Link href="/dashboard/billing">Billing</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/20" />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/" })}
                className="cursor-pointer text-red-600 hover:bg-red-600/30 hover:text-red-700 font-medium"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default NavHeader;
