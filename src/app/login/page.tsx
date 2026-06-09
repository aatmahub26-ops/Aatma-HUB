
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

import { auth, googleProvider } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

import { Gamepad2, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);

      toast({
        title: "Welcome!",
        description: "Google login successful.",
      });

      sessionStorage.setItem("show_welcome_popup", "true");
      router.push("/");
    } catch (error: any) {
      console.error(error);

      toast({
        title: "Google Login Failed",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Missing Fields",
        description: "Please enter email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);

      toast({
        title: "Welcome back!",
        description: "Login successful.",
      });

      sessionStorage.setItem("show_welcome_popup", "true");
      router.push("/");
    } catch (error: any) {
      console.error("Login error:", error);

      let errorMessage = "Invalid email or password.";

      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        errorMessage = "Invalid credentials provided.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage =
          "Too many failed attempts. Please try again later.";
      }

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Gamepad2 className="h-10 w-10" />
            </div>

            <CardTitle>WELCOME BACK</CardTitle>

            <CardDescription>
              Enter your credentials to access your HUB account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>

                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-3 h-4 w-4" />

                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>

                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-3 h-4 w-4" />

                  <Input
                    id="password"
                    type="password"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
              >
                Google Sign In
              </Button>
            </form>
          </CardContent>

          <CardFooter>
            <p className="text-center w-full text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="font-bold">
                Join the HUB
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

