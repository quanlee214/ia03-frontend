// import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import * as Lucide from "lucide-react";

const loginSchema = z.object({
  email: z.string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email format")
    .max(255, "Email must be less than 255 characters"),
  password: z.string()
    .trim()
    .min(1, "Password is required")
    .max(100, "Password must be less than 100 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const { toast } = useToast();
  // Removed unused isLoading state

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const navigate = useNavigate();
  const mutation = useMutation<any, any, LoginFormData>({
    mutationFn: async (formData: LoginFormData) => {
      const res = await fetch("http://localhost:3000/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Login successful!",
        description: `Welcome, ${data.email || "user"}`,
      });
      // Lưu thông tin user vào localStorage
      if (data.email) {
        localStorage.setItem("user", JSON.stringify({ email: data.email }));
      }
      setTimeout(() => {
        navigate("/");
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Unknown error",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: LoginFormData) => {
    mutation.mutate(data);
  };

  return (
  <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-[#eaf4fb] via-[#f7fafd] to-[#5997c6]/10">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <Lucide.ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

  <Card className="shadow-glow border border-[#5997c6]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  disabled={mutation.isPending || mutation.isSuccess}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  disabled={mutation.isPending || mutation.isSuccess}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-[#5997c6] text-white hover:bg-[#4176a3]"
                disabled={mutation.isPending || mutation.isSuccess}
              >
                {mutation.isPending ? (
                  "Signing in..."
                ) : (
                  <>
                    <Lucide.LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 p-3 bg-muted rounded-lg">
              {mutation.isError && (
                <p className="text-sm text-red-500 text-center">
                  {(() => {
                    try {
                      // Nếu backend trả về JSON lỗi, lấy message
                      const err = JSON.parse(mutation.error?.message);
                      return err.message || "Login failed";
                    } catch {
                      // Nếu không phải JSON, in trực tiếp
                      return mutation.error?.message || "Login failed";
                    }
                  })()}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-center w-full text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;