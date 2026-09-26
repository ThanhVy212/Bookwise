import React from "react";
import Image from "next/image";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { getSentNotificationsAdmin } from "@/lib/actions/notification.actions";
import { getInitials, getImageKitUrl } from "@/lib/utils";
import SendNotificationForm from "@/components/admin/SendNotificationForm";
import { Bell, Radio, CheckCheck } from "lucide-react";

const AdminNotificationsPage = async () => {
  const [usersList, sentResult] = await Promise.all([
    db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        universityId: users.universityId,
      })
      .from(users)
      .orderBy(users.fullName),
    getSentNotificationsAdmin({ limit: 15 }),
  ]);

  const sentNotifications = sentResult.success ? sentResult.data : [];

  return (
    <div className="space-y-8">
      {/* Top Card: Push Notification Form */}
      <section className="w-full rounded-2xl bg-white p-4 sm:p-7 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-primary-admin">
              <Radio className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-dark-400 sm:text-xl">
                Push Custom Notification
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Send real-time alerts and announcements to students via Socket.IO.
              </p>
            </div>
          </div>
        </div>

        <SendNotificationForm usersList={JSON.parse(JSON.stringify(usersList))} />
      </section>

      {/* Bottom Card: History of Sent Notifications */}
      <section className="w-full rounded-2xl bg-white p-4 sm:p-7 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Bell className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-dark-400 sm:text-lg">
                Recently Dispatched Notifications
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                History of notifications delivered to users across the system.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto min-h-[250px]">
          <table className="w-full min-w-[800px] table-fixed">
            <colgroup>
              <col className="w-[20%]" />
              <col className="w-[18%]" />
              <col className="w-[15%]" />
              <col className="w-[32%]" />
              <col className="w-[15%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Recipient
                </th>
                <th className="pb-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="pb-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="pb-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Message Content
                </th>
                <th className="pb-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Dispatched At
                </th>
              </tr>
            </thead>
            <tbody>
              {sentNotifications.map((n: any) => (
                <tr
                  key={n.id}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                >
                  {/* Recipient */}
                  <td className="py-4">
                    <div className="flex items-center gap-2.5">
                      {n.user?.avatarUrl ? (
                        <Image
                          src={getImageKitUrl(n.user.avatarUrl)}
                          alt={n.user.fullName}
                          width={32}
                          height={32}
                          className="size-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex size-8 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-900">
                          {getInitials(n.user?.fullName || "User")}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-dark-400 text-xs truncate">
                          {n.user?.fullName}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {n.user?.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-4">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                      {n.type}
                    </span>
                  </td>

                  {/* Title */}
                  <td className="py-4 text-xs font-bold text-dark-400 truncate">
                    {n.title}
                  </td>

                  {/* Message */}
                  <td className="py-4 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {n.message}
                  </td>

                  {/* Date */}
                  <td className="py-4 text-right text-xs text-slate-400">
                    <div className="flex items-center justify-end gap-1">
                      {n.isRead && (
                        <CheckCheck className="size-3.5 text-blue-500" title="Read by user" />
                      )}
                      <span>
                        {new Date(n.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-[11px] text-slate-400 md:hidden">
          Scroll horizontally to see all columns
        </p>

        {sentNotifications.length === 0 && (
          <div className="mt-8 flex flex-col items-center justify-center py-12">
            <Bell className="size-12 text-slate-300" />
            <p className="mt-3 text-base font-semibold text-dark-400">
              No notifications dispatched yet
            </p>
            <p className="text-xs text-slate-500">
              Compose a custom notification above to reach your users in real time.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminNotificationsPage;
