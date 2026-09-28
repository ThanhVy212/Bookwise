"use client";

import React, { useState, useTransition } from "react";
import { triggerOverdueScanAdmin } from "@/lib/actions/notification.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Clock,
  Mail,
  Bell,
  RefreshCw,
  CheckCircle2,
  Calendar,
  DollarSign,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OverdueRecord {
  recordId: string;
  borrowDate: string | Date;
  dueDate: string;
  userId: string;
  userName: string;
  userEmail: string;
  bookId: string;
  bookTitle: string;
}

interface OverdueScannerCardProps {
  initialTotalOverdue: number;
  initialOverdueRecords: OverdueRecord[];
}

const OverdueScannerCard = ({
  initialTotalOverdue,
  initialOverdueRecords,
}: OverdueScannerCardProps) => {
  const [isPending, startTransition] = useTransition();
  const [force, setForce] = useState<boolean>(false);
  const [totalOverdue, setTotalOverdue] = useState<number>(initialTotalOverdue);
  const [overdueRecords, setOverdueRecords] =
    useState<OverdueRecord[]>(initialOverdueRecords);
  const [lastScanResult, setLastScanResult] = useState<{
    notifiedCount: number;
    skippedCount: number;
    errorCount: number;
    totalOverdue: number;
  } | null>(null);
  const router = useRouter();

  const handleScanNow = () => {
    startTransition(async () => {
      try {
        const result = await triggerOverdueScanAdmin({ force });
        if (result.success) {
          const notifiedCount = result.notifiedCount ?? 0;
          const skippedCount = result.skippedCount ?? 0;
          const errorCount = result.errorCount ?? 0;
          const totalOverdueCount = result.totalOverdue ?? 0;

          setLastScanResult({
            notifiedCount,
            skippedCount,
            errorCount,
            totalOverdue: totalOverdueCount,
          });
          setTotalOverdue(totalOverdueCount);

          if (totalOverdueCount === 0) {
            toast.info("No overdue books detected right now. Great job!");
          } else if (notifiedCount > 0) {
            toast.success(
              `Successfully dispatched ${notifiedCount} overdue email(s) and real-time notification(s)!`,
            );
          } else if (skippedCount > 0) {
            toast.info(
              `All ${skippedCount} overdue student(s) have already received notifications today. Check "Force re-send" to bypass.`,
            );
          }
          router.refresh();
        } else {
          toast.error(result.error || "Failed to process overdue borrows");
        }
      } catch (err: any) {
        toast.error(err?.message || "An error occurred during overdue scan");
      }
    });
  };

  return (
    <section className="w-full rounded-2xl bg-white p-4 sm:p-7 shadow-2xs border border-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-dark-400 sm:text-xl">
                Automated Overdue Notice & Scanner
              </h2>
              {totalOverdue > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-bold text-rose-600 border border-rose-200">
                  {totalOverdue} overdue
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 border border-emerald-200">
                  All clear
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Automatically identifies overdue borrow records and sends email alerts + real-time Socket.IO notifications.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={force}
              onChange={(e) => setForce(e.target.checked)}
              className="size-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            <span>Force re-send (ignore daily limit)</span>
          </label>

          <Button
            type="button"
            onClick={handleScanNow}
            disabled={isPending}
            className="h-10 px-5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 shadow-md cursor-pointer transition-all"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="size-4 animate-spin" />
                Scanning & Dispatching...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <RefreshCw className="size-4" />
                Scan & Send Notices Now
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Info Cards / Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Currently Overdue</span>
            <Clock className="size-4 text-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-dark-400">
            {totalOverdue} <span className="text-xs font-normal text-slate-500">book(s)</span>
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Notice Channels</span>
            <div className="flex gap-1">
              <Mail className="size-4 text-blue-500" />
              <Bell className="size-4 text-amber-500" />
            </div>
          </div>
          <p className="mt-2 text-sm font-bold text-dark-400">
            Email (Resend) + Socket.IO Push
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Automated Cron API</span>
            <Calendar className="size-4 text-purple-500" />
          </div>
          <p className="mt-2 text-xs font-mono font-semibold text-slate-700 truncate" title="/api/cron/overdue">
            /api/cron/overdue
          </p>
        </div>
      </div>

      {/* Last Scan Feedback */}
      {lastScanResult && (
        <div className="rounded-xl bg-blue-50/70 border border-blue-200/70 p-3.5 text-xs text-blue-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-blue-600 shrink-0" />
            <span>
              Last scan completed: <strong>{lastScanResult.notifiedCount}</strong> dispatched,{" "}
              <strong>{lastScanResult.skippedCount}</strong> skipped (already notified today),{" "}
              <strong>{lastScanResult.errorCount}</strong> error(s).
            </span>
          </div>
        </div>
      )}

      {/* Overdue Items List */}
      {overdueRecords.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Overdue Borrow Records Requiring Return ({overdueRecords.length})
          </h4>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {overdueRecords.map((item) => {
              const diffDays = Math.max(
                1,
                Math.floor(
                  (new Date().getTime() - new Date(item.dueDate).getTime()) /
                    (1000 * 60 * 60 * 24),
                ),
              );
              const estimatedFine = diffDays * 5000;

              return (
                <div
                  key={item.recordId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-rose-100 bg-rose-50/30 text-xs"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-dark-400 text-sm">
                      {item.bookTitle}
                    </p>
                    <p className="text-slate-500">
                      Borrower: <strong className="text-slate-800">{item.userName}</strong> (
                      {item.userEmail})
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-right sm:text-right">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Due Date</span>
                      <span className="font-semibold text-rose-600">
                        {new Date(item.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">Overdue By</span>
                      <span className="font-bold text-rose-600">
                        {diffDays} {diffDays === 1 ? "day" : "days"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">Estimated Fine</span>
                      <span className="font-bold text-amber-700">
                        {estimatedFine.toLocaleString("vi-VN")} VND
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-1">
          <CheckCircle2 className="size-6 text-emerald-500" />
          <p className="font-semibold text-dark-400 mt-1">No overdue books at the moment</p>
          <p className="text-slate-400">All borrowed books are within their active return windows.</p>
        </div>
      )}

      {/* Footer Info on Automation */}
      <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 border border-slate-100">
        <Info className="size-4 text-slate-400 shrink-0 mt-0.5" />
        <p>
          <strong>Cron Automation Tip:</strong> To automate daily scans at midnight or on a schedule, configure an Upstash QStash schedule or Vercel Cron to ping <code className="bg-slate-200/70 px-1 py-0.5 rounded text-dark-400">GET/POST /api/cron/overdue</code>.
        </p>
      </div>
    </section>
  );
};

export default OverdueScannerCard;
