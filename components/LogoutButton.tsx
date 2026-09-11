"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

const LogoutButton = () => {
  return (
    <Button
      className="cursor-pointer mb-10"
      onClick={() => signOut({ callbackUrl: "/sign-in" })}
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
