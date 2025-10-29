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

const signUpSchema = z.object({
  email: z.string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email format")
    .max(255, "Email must be less than 255 characters"),
  password: z.string()
    .trim()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
  confirmPassword: z.string()
    .trim()
    .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  // Removed unused isLoading/isSuccess state

  const { register, handleSubmit, formState: { errors } } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const mutation = useMutation<any, any, SignUpFormData>({
    mutationFn: async (formData: SignUpFormData) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const res = await fetch(`${apiUrl}/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration successful!",
        description: "Account created. Redirecting to home...",
        duration: 1000,
        className: "bg-green-100 border-green-500 text-green-900 shadow-lg"
      });
      setTimeout(() => {
        navigate("/");
      }, 2000);
    },
    onError: (error: any) => {
      let message = "Registration failed";
      try {
        const err = JSON.parse(error.message);
        message = err.message || message;
      } catch {
        if (typeof error.message === "string") message = error.message;
      }
      toast({
        title: message,
        duration: 1000,
        className: "bg-red-100 border-red-500 text-red-900 shadow-lg"
      });
    }
  });

  const onSubmit = (data: SignUpFormData) => {
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
            <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to register
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  disabled={mutation.isPending || mutation.isSuccess}
                  className={errors.confirmPassword ? "border-destructive" : ""}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-[#5997c6] text-white hover:bg-[#4176a3]"
                disabled={mutation.isPending || mutation.isSuccess}
              >
                {mutation.isPending ? (
                  <>
                    <Lucide.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : mutation.isSuccess ? (
                  "Redirecting..."
                ) : (
                  <>
                    <Lucide.UserPlus className="mr-2 h-4 w-4" />
                    Sign Up
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
                      return err.message || "Registration failed";
                    } catch {
                      // Nếu không phải JSON, in trực tiếp
                      return mutation.error?.message || "Registration failed";
                    }
                  })()}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-center w-full text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;