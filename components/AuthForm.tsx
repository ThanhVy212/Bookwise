"use client";

import React, { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
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
import { FIELD_NAMES } from "@/constants";
import {
  AuthFormValues,
  authSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validations";

interface AuthFormProps {
  type: "sign-in" | "sign-up";
}

const AuthForm = ({ type }: AuthFormProps) => {
  const isSignIn = type === "sign-in";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      fullName: "",
      email: "",
      universityId: "",
      universityCard: "",
      password: "",
    },
  });

  const onSubmit = async (values: AuthFormValues) => {
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

    console.log(result.data);
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
                      placeholder="eg: 394365762"
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
                    {FIELD_NAMES.universityCard} (file upload)
                  </FormLabel>
                  <FormControl>
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFileName(file.name);
                            field.onChange(file.name);
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="upload-btn"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Image
                          src="/icons/upload.svg"
                          alt="upload"
                          width={20}
                          height={20}
                        />
                        <span>Upload a file</span>
                      </button>
                      {fileName && (
                        <p className="upload-filename text-light-100">
                          {fileName}
                        </p>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <Button type="submit" className="form-btn mt-6">
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
