"use client";

import { Toaster } from "@/components/ui/toast";
import SocketProvider from "@/components/SocketProvider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SocketProvider>
      {children}
      <Toaster />
    </SocketProvider>
  );
};

export default Providers;
