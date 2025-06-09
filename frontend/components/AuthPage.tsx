"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loginData, signupData } from "@/types/auth";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const AuthPage = () => {
  const [loading, setloading] = useState<boolean>(false);
  const [loginData, setloginData] = useState<loginData>({
    email: "",
    password: "",
  });

  const [signupData, setsignupData] = useState<signupData>({
    name: "",
    email: "",
    password: "",
  });

  const router = useRouter();

  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setloading(true);

    const response = await axios.post(
      "http://localhost:3000/api/auth/login",
      loginData
    );
    if (response.status === 200) {
      console.log("Login successful");
      toast.success("Login successful!");
      router.push("/dashboard");
    } else {
      console.error("Login failed");
      toast.error("Login failed. Please try again.");
    }
  };

  const handleSubmitSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setloading(true);
    const response = await axios.post(
      "http://localhost:3000/api/auth/signup",
      signupData
    );

    if (response.status === 201) {
      console.log("Signup successful");
      toast.success("Signup successful! Please login.");
      router.push("/dashboard");
    } else {
      console.error("Signup failed");
      toast.error("Signup failed. Please try again.");
    }
    console.log("Signup Data:", signupData);
  };

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account.
            </CardDescription>
          </CardHeader>

          <form>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-login">Email</Label>
                <Input
                  id="email-login"
                  type="email"
                  placeholder="m@example.com"
                  required
                  onChange={(e) =>
                    setloginData({ ...loginData, email: e.target.value })
                  }
                  value={loginData.email}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password-login">Password</Label>
                </div>
                <Input
                  id="password-login"
                  type="password"
                  required
                  onChange={(e) =>
                    setloginData({ ...loginData, password: e.target.value })
                  }
                  value={loginData.password}
                  placeholder="**********"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                onClick={handleSubmitLogin}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>

      <TabsContent value="signup">
        <Card>
          <CardHeader>
            <CardTitle>Sign up</CardTitle>
            <CardDescription>Create an account to get started.</CardDescription>
          </CardHeader>

          <form>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  required
                  onChange={(e) =>
                    setsignupData({ ...signupData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-signup">Email</Label>
                <Input
                  id="email-signup"
                  type="email"
                  placeholder="m@example.com"
                  required
                  onChange={(e) =>
                    setsignupData({ ...signupData, email: e.target.value })
                  }
                  value={signupData.email}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signup">Password</Label>
                <Input
                  id="password-signup"
                  type="password"
                  required
                  onChange={(e) =>
                    setsignupData({ ...signupData, password: e.target.value })
                  }
                  placeholder="**********"
                  value={signupData.password}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                onClick={handleSubmitSignup}
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AuthPage;
