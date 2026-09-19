import React from "react";
import Image from "next/image";
import { getAccountRequests } from "@/lib/actions/admin.actions";
import { getInitials, getImageKitUrl } from "@/lib/utils";
import AccountRequestActions from "@/components/admin/AccountRequestActions";
import ViewIdCardModal from "@/components/admin/ViewIdCardModal";

const AccountRequestsPage = async () => {
  const result = await getAccountRequests();

  if (!result.success) {
    return (
      <section className="w-full rounded-2xl bg-white p-7">
        <p className="text-red-500">Failed to load account requests</p>
      </section>
    );
  }

  const requests = result.data;

  return (
    <section className="w-full rounded-2xl bg-white p-7">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Account Registration Requests</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Oldest to Recent</span>
          <Image
            src="/icons/admin/sort.svg"
            alt="sort"
            width={16}
            height={16}
          />
        </div>
      </div>

      <div className="mt-7 w-full overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-4 text-left text-sm font-medium text-slate-500">
                Name
              </th>
              <th className="pb-4 text-left text-sm font-medium text-slate-500">
                Date Joined
              </th>
              <th className="pb-4 text-left text-sm font-medium text-slate-500">
                University ID No
              </th>
              <th className="pb-4 text-left text-sm font-medium text-slate-500">
                University ID Card
              </th>
              <th className="pb-4 text-right text-sm font-medium text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.map((user: any) => (
              <tr
                key={user.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    {user.avatarUrl ? (
                      <Image
                        src={getImageKitUrl(user.avatarUrl)}
                        alt={user.fullName}
                        width={40}
                        height={40}
                        className="size-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-dark-400">
                        {getInitials(user.fullName)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-dark-400">
                        {user.fullName}
                      </p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 text-sm text-slate-500">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </td>
                <td className="py-4 text-sm text-slate-500">
                  {user.universityId}
                </td>
                <td className="py-4">
                  <ViewIdCardModal user={user} />
                </td>
                <td className="py-4">
                  <AccountRequestActions userId={user.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {requests.length === 0 && (
        <div className="mt-10 flex flex-col items-center justify-center py-16">
          <Image
            src="/icons/admin/empty-state.svg"
            alt="empty"
            width={80}
            height={80}
            className="opacity-50"
          />
          <p className="mt-4 text-lg font-semibold text-dark-400">
            No Pending Account Requests
          </p>
          <p className="text-sm text-slate-500">
            There are currently no account requests awaiting approval.
          </p>
        </div>
      )}
    </section>
  );
};

export default AccountRequestsPage;
