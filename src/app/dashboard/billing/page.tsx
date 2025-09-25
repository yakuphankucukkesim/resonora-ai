"use client";

import type { VariantProps } from "class-variance-authority";
import { ArrowLeftIcon, CheckIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { createCheckoutSession, type PriceId } from "~/actions/stripe";
import { Button, type buttonVariants } from "~/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface PricingPlan {
  title: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: VariantProps<typeof buttonVariants>["variant"];
  isPopular?: boolean;
  savePercentage?: string;
  priceId: PriceId;
}

const plans: PricingPlan[] = [
  {
    title: "Small Pack",
    price: "$9.99",
    description: "Perfect for occasional podcast creators",
    features: ["50 credits", "No expiration", "Download all clips"],
    buttonText: "Buy 50 credits",
    buttonVariant: "outline",
    priceId: "small",
  },
  {
    title: "Medium Pack",
    price: "$24.99",
    description: "Best value for regular podcasters",
    features: ["150 credits", "No expiration", "Download all clips"],
    buttonText: "Buy 150 credits",
    buttonVariant: "default",
    isPopular: true,
    savePercentage: "Save 17%",
    priceId: "medium",
  },
  {
    title: "Large Pack",
    price: "$69.99",
    description: "Ideal for podcast studioes and agencies",
    features: ["500 credits", "No expiration", "Download all clips"],
    buttonText: "Buy 500 credits",
    buttonVariant: "outline",
    isPopular: false,
    savePercentage: "Save 30%",
    priceId: "large",
  },
];

function PricingCard({ plan }: { plan: PricingPlan }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await createCheckoutSession(plan.priceId);
    } catch (err) {
      console.error("Error creating checkout session:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {plan.isPopular && (
        <div className="bg-gradient-to-r from-white to-purple-500 text-white absolute -top-3 left-1/2 -translate-x-1/2 transform rounded-full px-4 py-1 text-sm font-medium whitespace-nowrap shadow-lg animate-pulse z-50">
          ⭐ Most Popular
        </div>
      )}
      <Card
        className={cn(
          "relative flex flex-col transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden group bg-white/20 backdrop-blur-md border-white/10 z-0",
          plan.isPopular && "border-2 border-blue-400 shadow-xl scale-105 mt-6"
        )}
      >
        {/* Background Gradient */}
        <div className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          plan.isPopular 
            ? "bg-gradient-to-br from-blue-500/10 to-purple-500/10" 
            : "bg-gradient-to-br from-white/5 to-blue-500/5"
        )}></div>
        
        <CardHeader className="relative z-10 flex-1 text-center pb-4 pt-6">
        <CardTitle className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
          {plan.title}
        </CardTitle>
        <div className="text-5xl font-bold text-white my-2 group-hover:scale-110 transition-transform duration-300">
          {plan.price}
        </div>
        {plan.savePercentage && (
          <p className="text-sm font-medium text-green-400 bg-green-500/20 px-3 py-1 rounded-full inline-block animate-pulse">
            {plan.savePercentage}
          </p>
        )}
        <CardDescription className="text-white/80 text-base group-hover:text-white transition-colors duration-300">
          {plan.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10 space-y-3 pb-6">
        <ul className="space-y-3 text-sm">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300">
              <div className="bg-green-500/20 rounded-full p-1 group-hover:scale-110 transition-transform duration-300">
                <CheckIcon className="text-green-400 size-4" />
              </div>
              <span className="text-white/90 font-medium group-hover:text-white transition-colors duration-300">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="relative z-10 pt-0">
        <div className="w-full space-y-2">
          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/20 rounded-lg p-2">
              {error}
            </div>
          )}
          <Button 
            variant={plan.buttonVariant} 
            className={cn(
              "w-full h-12 text-lg font-semibold transition-all duration-500 rounded-xl",
              plan.isPopular 
                ? "bg-gradient-to-r text-white border-0 shadow-lg hover:shadow-xl hover:bg-gradient-to-r hover:from-white/20 hover:to-blue-500/20 hover:border-blue-400 hover:scale-105" 
                : "bg-white/10 text-white border-white/20 hover:bg-gradient-to-r hover:from-white/20 hover:to-blue-500/20 hover:border-blue-400 hover:scale-105"
            )}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : plan.buttonText}
          </Button>
        </div>
      </CardFooter>
    </Card>
    </div>
  );
}

export default function BillingPage() {
  return (
    <div className="mx-auto max-w-6xl flex flex-col space-y-12 px-4 py-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-white/20 backdrop-blur-md border border-white/10 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-4 right-4 animate-float">
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl"></div>
        </div>
        <div className="absolute bottom-4 left-4 animate-float-delayed">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-pink-400/20 to-blue-400/20 blur-xl"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center gap-4">
          <Button
            className="absolute top-0 left-0 bg-white/10 border-white/20 hover:bg-white/20 text-white shadow-lg"
            variant="outline"
            size="icon"
            asChild
          >
            <Link href="/dashboard">
              <ArrowLeftIcon className="size-4" />
            </Link>
          </Button>
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl flex items-center justify-center space-x-3">
              <span className="text-5xl">⭐</span>
              <span>Buy Credits</span>
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Purchase credits to generate more podcast clips. The more credits
              you buy, the better the value.
            </p>
            <div className="flex items-center justify-center space-x-6 mt-6">
              <div className="flex items-center space-x-2 text-sm text-white/70">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Instant Activation</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-white/70">
                <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>No Expiration</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-white/70">
                <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span>Best Value</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <PricingCard key={plan.title} plan={plan} />
        ))}
      </div>

      <div className="relative overflow-hidden bg-white/20 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2220%22%20cy%3D%2220%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-4 right-4 animate-float">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl"></div>
        </div>
        <div className="absolute bottom-4 left-4 animate-float-delayed">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-pink-400/20 to-blue-400/20 blur-xl"></div>
        </div>
        
        <div className="relative z-10">
          <h3 className="mb-8 text-3xl font-bold text-white text-center flex items-center justify-center space-x-2">
            <span className="text-4xl">💡</span>
            <span>How credits work</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4 group hover:translate-x-2 transition-transform duration-300">
                <div className="bg-blue-500/20 rounded-full p-3 mt-1 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white text-lg group-hover:text-purple-400 transition-colors duration-300">Credit Usage</h4>
                  <p className="text-white/80">1 credit = 1 minute of podcast processing</p>
                </div>
              </div>
              <div className="flex items-start gap-4 group hover:translate-x-2 transition-transform duration-300">
                <div className="bg-blue-500/20 rounded-full p-3 mt-1 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white text-lg group-hover:text-purple-400 transition-colors duration-300">Clip Generation</h4>
                  <p className="text-white/80">Around 1 clip per 5 minutes of podcast</p>
                </div>
              </div>
              <div className="flex items-start gap-4 group hover:translate-x-2 transition-transform duration-300">
                <div className="bg-blue-500/20 rounded-full p-3 mt-1 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white text-lg group-hover:text-purple-400 transition-colors duration-300">No Expiration</h4>
                  <p className="text-white/80">Credits never expire and can be used anytime</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4 group hover:translate-x-2 transition-transform duration-300">
                <div className="bg-blue-500/20 rounded-full p-3 mt-1 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white text-lg group-hover:text-purple-400 transition-colors duration-300">Duration Based</h4>
                  <p className="text-white/80">Longer podcasts require more credits based on duration</p>
                </div>
              </div>
              <div className="flex items-start gap-4 group hover:translate-x-2 transition-transform duration-300">
                <div className="bg-blue-500/20 rounded-full p-3 mt-1 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">5</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white text-lg group-hover:text-purple-400 transition-colors duration-300">One-time Purchase</h4>
                  <p className="text-white/80">All packages are one-time purchases (not subscription)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}