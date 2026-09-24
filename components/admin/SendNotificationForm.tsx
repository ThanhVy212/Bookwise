"use client";

import React, { useState, useTransition } from "react";
import { sendCustomNotificationAdmin } from "@/lib/actions/notification.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Send,
  Users,
  User,
  Radio,
  Sparkles,
  Link as LinkIcon,
  Bell,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface UserOption {
  id: string;
  fullName: string;
  email: string;
  universityId: number | string;
}

interface SendNotificationFormProps {
  usersList: UserOption[];
}

const NOTIFICATION_TYPES = [
  { value: "ANNOUNCEMENT", label: "📢 Announcement", color: "text-blue-500" },
  { value: "UPDATE", label: "⚙️ System Update", color: "text-purple-500" },
  { value: "REMINDER", label: "⏳ Library Reminder", color: "text-amber-500" },
  { value: "ALERT", label: "⚠️ Important Alert", color: "text-rose-500" },
  { value: "GENERAL", label: "ℹ️ General Info", color: "text-emerald-500" },
];

const SendNotificationForm = ({ usersList }: SendNotificationFormProps) => {
  const [recipientType, setRecipientType] = useState<"ALL" | "SPECIFIC">("ALL");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [searchUser, setSearchUser] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [type, setType] = useState<string>("ANNOUNCEMENT");
  const [link, setLink] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filteredUsers = usersList.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
      String(u.universityId).includes(searchUser),
  );

  const selectedUser = usersList.find((u) => u.id === selectedUserId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a notification title");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (recipientType === "SPECIFIC" && !selectedUserId) {
      toast.error("Please select a specific recipient");
      return;
    }

    startTransition(async () => {
      const result = await sendCustomNotificationAdmin({
        recipientType,
        userId: recipientType === "SPECIFIC" ? selectedUserId : undefined,
        title,
        message,
        type,
        link,
      });

      if (result.success) {
        toast.success(result.message || "Notification sent via Socket.IO 🚀");
        setTitle("");
        setMessage("");
        setLink("");
        if (recipientType === "SPECIFIC") {
          setSelectedUserId("");
          setSearchUser("");
        }
        router.refresh();
      } else {
        toast.error(result.error || "Failed to send notification");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Left */}
      <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
        {/* Recipient Selector */}
        <div>
          <label className="block text-sm font-semibold text-dark-400 mb-2">
            Target Audience
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRecipientType("ALL")}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                recipientType === "ALL"
                  ? "border-primary-admin bg-blue-50/60 text-primary-admin shadow-2xs"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Users className="size-4 shrink-0" />
              <div className="text-left">
                <p className="font-semibold">All Students</p>
                <p className="text-[11px] text-slate-400">
                  Broadcast to everyone ({usersList.length} users)
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRecipientType("SPECIFIC")}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                recipientType === "SPECIFIC"
                  ? "border-primary-admin bg-blue-50/60 text-primary-admin shadow-2xs"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <User className="size-4 shrink-0" />
              <div className="text-left">
                <p className="font-semibold">Specific Student</p>
                <p className="text-[11px] text-slate-400">
                  Send direct to 1 student
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Specific User Search */}
        {recipientType === "SPECIFIC" && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
            <label className="block text-xs font-semibold text-dark-400 uppercase tracking-wider">
              Select Student
            </label>
            <Input
              type="text"
              placeholder="Search by name, email, or student ID..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="bg-white"
            />

            {selectedUser && (
              <div className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>
                    Selected: <strong>{selectedUser.fullName}</strong> (
                    {selectedUser.email})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUserId("")}
                  className="text-emerald-700 hover:underline font-bold"
                >
                  Change
                </button>
              </div>
            )}

            {!selectedUserId && (
              <div className="max-h-40 overflow-y-auto space-y-1 rounded-lg border border-slate-200 bg-white p-2">
                {filteredUsers.length > 0 ? (
                  filteredUsers.slice(0, 8).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setSelectedUserId(u.id);
                        setSearchUser("");
                      }}
                      className="w-full flex items-center justify-between rounded-md p-2 text-left text-xs hover:bg-slate-100 transition-colors"
                    >
                      <span className="font-medium text-dark-400">
                        {u.fullName}
                      </span>
                      <span className="text-slate-400">{u.email}</span>
                    </button>
                  ))
                ) : (
                  <p className="py-2 text-center text-xs text-slate-400">
                    No students matched your search
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Category Type */}
        <div>
          <label className="block text-sm font-semibold text-dark-400 mb-2">
            Notification Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {NOTIFICATION_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  type === t.value
                    ? "border-primary-admin bg-primary-admin text-white shadow-2xs"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-dark-400 mb-1.5">
            Notification Title
          </label>
          <Input
            type="text"
            placeholder="e.g., Library Open Hours Extended During Exams 📚"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            required
            className="bg-white"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-semibold text-dark-400 mb-1.5">
            Message Content
          </label>
          <Textarea
            rows={4}
            placeholder="Write your custom announcement or reminder here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            required
            className="bg-white"
          />
          <span className="text-[11px] text-slate-400 mt-1 block text-right">
            {message.length}/500 characters
          </span>
        </div>

        {/* Link */}
        <div>
          <label className="block text-sm font-semibold text-dark-400 mb-1.5 flex items-center gap-1.5">
            <LinkIcon className="size-3.5 text-slate-400" />
            <span>Target Action Link (Optional)</span>
          </label>
          <Input
            type="text"
            placeholder="e.g., /library or /books/123"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="bg-white"
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-12 rounded-xl bg-primary-admin text-white text-base font-semibold hover:bg-primary-admin/90 shadow-md cursor-pointer"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Radio className="size-4 animate-spin" />
              Broadcasting via Socket.IO...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send className="size-4" />
              Push Real-time Notification
            </span>
          )}
        </Button>
      </form>

      {/* Live Preview Right Column */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-dark-400 font-bold text-sm">
          <Sparkles className="size-4 text-primary-admin" />
          <span>Real-time Student Preview</span>
        </div>

        {/* Toast Popup Preview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Live Toast Alert (Socket.IO)
            </span>
            <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
          </div>

          <div className="flex items-start gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 shrink-0">
              <Bell className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {title || "Notification Title Here..."}
              </p>
              <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                {message ||
                  "The message content will appear in real-time as a pop-up toast on students' screens."}
              </p>
              {link && (
                <span className="inline-block mt-2 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                  Link: {link}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* In-App Notification Item Preview */}
        <div className="rounded-2xl border border-slate-200 bg-dark-100 p-4 shadow-lg space-y-3 text-white">
          <div className="flex items-center justify-between border-b border-light-100/10 pb-2">
            <span className="text-[11px] font-bold text-light-100/60 uppercase tracking-wider">
              Notification Center Entry
            </span>
            <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] text-rose-400 font-bold">
              Unread
            </span>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-dark-300/80 p-3 border border-primary/20">
            <div className="mt-0.5 size-2 rounded-full bg-rose-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {title || "Notification Title Here..."}
              </p>
              <p className="text-xs text-light-100/80 mt-1 line-clamp-2 leading-relaxed">
                {message ||
                  "Detailed description shown inside the notification dropdown."}
              </p>
              <span className="text-[10px] text-light-100/50 mt-1.5 block">
                Just now
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendNotificationForm;
