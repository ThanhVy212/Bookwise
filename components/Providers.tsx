"use client";

import { Toaster } from "@/components/ui/toast";
import { Toaster as SonnerToaster } from "sonner";
import SocketProvider from "@/components/SocketProvider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SocketProvider>
      {children}
      <Toaster />
      <SonnerToaster position="top-center" theme="dark" richColors />
    </SocketProvider>
  );
};

export default Providers;
