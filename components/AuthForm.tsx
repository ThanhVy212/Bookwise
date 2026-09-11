"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import ImageUpload from "@/components/ImageUpload";
import { FIELD_NAMES } from "@/constants";
import {
  AuthFormValues,
  authSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validations";
import { signInWithCredentials, signUp } from "@/lib/actions/auth.actions";
import { toast } from "@/components/ui/toast";

interface AuthFormProps {
  type: "sign-in" | "sign-up";
}

const AuthForm = ({ type }: AuthFormProps) => {
  const isSignIn = type === "sign-in";
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      fullName: "",
      email: "",
      universityId: 0,
      universityCard: "",
      password: "",
    },
  });

  const onSubmit = async (values: AuthFormValues) => {
    if (loading) return;

    const schema = isSignIn ? signInSchema : signUpSchema;
    const result = schema.safeParse(values);

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        form.setError(issue.path[0] as keyof AuthFormValues, {
          message: issue.message,
        });
      });
      return;
    }

    setLoading(true);

    const loadingToast = toast.add({
      type: "loading",
      title: isSignIn ? "Signing In..." : "Creating Account...",
      description: "Please wait while we process your request.",
    });

    try {
      const response = isSignIn
        ? await signInWithCredentials({
            email: result.data.email,
            password: result.data.password,
          })
        : await signUp(result.data as AuthCredentials);

      if (response?.success) {
        if ("signInFailed" in response && response.signInFailed) {
          toast.update(loadingToast, {
            type: "success",
            title: "Account Created!",
            description:
              "Your account has been created. Please sign in to continue.",
          });
          router.push("/sign-in");
        } else {
          toast.update(loadingToast, {
            type: "success",
            title: isSignIn ? "Welcome Back!" : "Account Created!",
            description: isSignIn
              ? "You have successfully signed in."
              : "Your account has been created successfully.",
          });
          router.push("/");
        }
      } else {
        toast.update(loadingToast, {
          type: "error",
          title: isSignIn ? "Sign In Failed" : "Sign Up Failed",
          description: isSignIn
            ? "Invalid email or password. Please try again."
            : "Failed to create account. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-row items-center gap-3">
          <Image src="/icons/logo.svg" alt="logo" width={37} height={37} />
          <h1 className="text-2xl font-semibold text-white">BookWise</h1>
        </div>

        <h2 className="mt-6 text-3xl font-semibold text-white">
          {isSignIn
            ? "Welcome Back to the BookWise"
            : "Create Your Library Account"}
        </h2>

        <div className="mt-6 flex flex-col gap-5">
          {!isSignIn && (
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">
                    {FIELD_NAMES.fullName}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your full name"
                      className="form-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">
                  {FIELD_NAMES.email}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your email"
                    className="form-input"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!isSignIn && (
            <FormField
              control={form.control}
              name="universityId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">
                    {FIELD_NAMES.universityId}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="eg: 394365762"
                      className="form-input"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === "" ? undefined : Number(val));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">
                  {FIELD_NAMES.password}
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Atleast 8 characters long"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!isSignIn && (
            <FormField
              control={form.control}
              name="universityCard"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">
                    {FIELD_NAMES.universityCard}
                  </FormLabel>
                  <FormControl>
                    <ImageUpload
                      type="image"
                      accept="image/*"
                      placeholder="Upload your university card"
                      folder="university-cards"
                      variant="dark"
                      onFileChange={field.onChange}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <Button type="submit" className="form-btn mt-6" disabled={loading}>
          {isSignIn ? "Login" : "Sign Up"}
        </Button>

        <p className="mt-5 text-center text-sm text-light-100">
          {isSignIn ? (
            <>
              Don&apos;t have an account already?{" "}
              <Link href="/sign-up" className="font-semibold text-primary">
                Register here
              </Link>
            </>
          ) : (
            <>
              Have an account already?{" "}
              <Link href="/sign-in" className="font-semibold text-primary">
                Login
              </Link>
            </>
          )}
        </p>
      </form>
    </Form>
  );
};

export default AuthForm;
