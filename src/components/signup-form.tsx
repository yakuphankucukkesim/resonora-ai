"use client";

import { cn } from "~/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Link from "next/link";
import { signupSchema, type SignupFormValues } from "~/schemas/auth";
import { signUp } from "~/actions/auth";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const result = await signUp(data);
      if (!result.success) {
        setError(result.error ?? "An error occured during signup");
        return;
      }

      const signUpResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signUpResult?.error) {
        setError(
          "Account created but couldn't sign in automatically. Please try again.",
        );
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error(error);
      setError("An unexpected error occured");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Sign up</CardTitle>
          <CardDescription className="text-white/80">
            Enter your email below to sign up to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-blue-400"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-300">{errors.email.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-white">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-blue-400"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-300">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {error && (
                <p className="rounded-md bg-red-500/20 border border-red-400/30 p-3 text-sm text-red-300">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full bg-gradient-to-r from-white-600 to-purple-600 hover:scale-105 text-white border-0 shadow-lg" disabled={isSubmitting}>
                {isSubmitting ? "Signing up..." : "Sign up"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm text-white/80">
              Already have an account?{" "}
              <Link href="/login" className="underline underline-offset-4 text-white hover:text-blue-200">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
