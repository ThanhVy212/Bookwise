"use client";

import React, { useState } from "react";
import Image from "next/image";

import { Input } from "@/components/ui/input";

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={`form-input pr-12 ${className ?? ""}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-4 top-1/2 -translate-y-1/2"
        >
          <Image
            src={showPassword ? "/icons/eye.svg" : "/icons/eye-off.svg"}
            alt={showPassword ? "Hide password" : "Show password"}
            width={20}
            height={20}
          />
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
