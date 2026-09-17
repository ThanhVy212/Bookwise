"use client";

import React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { cn } from "@/lib/utils";

interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface DialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const Dialog = ({ children, open, onOpenChange }: DialogProps) => {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </BaseDialog.Root>
  );
};

const DialogTrigger = ({ children, asChild, className }: DialogTriggerProps) => {
  if (React.isValidElement(children)) {
    return <BaseDialog.Trigger render={children} />;
  }

  return (
    <BaseDialog.Trigger className={className}>
      {children}
    </BaseDialog.Trigger>
  );
};

const DialogContent = ({ children, className }: DialogContentProps) => {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto pointer-events-none">
        <BaseDialog.Popup
          className={cn(
            "pointer-events-auto relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-7 shadow-2xl outline-none duration-200 animate-in fade-in zoom-in-95",
            className,
          )}
        >
          {children}
        </BaseDialog.Popup>
      </div>
    </BaseDialog.Portal>
  );
};

const DialogHeader = ({ children, className }: DialogHeaderProps) => {
  return (
    <div className={cn("flex flex-col items-center text-center gap-3 w-full", className)}>
      {children}
    </div>
  );
};

const DialogFooter = ({ children, className }: DialogFooterProps) => {
  return (
    <div className={cn("mt-6 flex flex-col gap-2.5 w-full sm:flex-row sm:justify-end", className)}>
      {children}
    </div>
  );
};

const DialogTitle = ({ children, className }: DialogTitleProps) => {
  return (
    <BaseDialog.Title
      className={cn("text-xl font-bold text-dark-400 text-center", className)}
    >
      {children}
    </BaseDialog.Title>
  );
};

const DialogDescription = ({ children, className }: DialogDescriptionProps) => {
  return (
    <BaseDialog.Description
      className={cn("text-center text-sm text-slate-500 leading-relaxed max-w-sm", className)}
    >
      {children}
    </BaseDialog.Description>
  );
};

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
