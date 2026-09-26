import React from "react";
import Image from "next/image";
import { getAllUsers } from "@/lib/actions/admin.actions";
import { getInitials, getImageKitUrl } from "@/lib/utils";
import UserActions from "@/components/admin/UserActions";
import ViewIdCardModal from "@/components/admin/ViewIdCardModal";

const UsersPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const query = params.query || "";

  const result = await getAllUsers({ page, limit: 10, query });

  if (!result.success) {
    return (
      <section className="w-full rounded-2xl bg-white p-4 sm:p-7">
        <p className="text-red-500">Failed to load users</p>
      </section>
    );
  }

  const { users, totalUsers, totalPages, currentPage } = result.data;

  return (
    <section className="w-full rounded-2xl bg-white p-4 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">All Users</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">A-Z</span>
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
                Role
              </th>
              <th className="pb-4 text-left text-sm font-medium text-slate-500">
                Books Borrowed
              </th>
              <th className="pb-4 text-left text-sm font-medium text-slate-500">
                University ID No
              </th>
              <th className="pb-4 text-left text-sm font-medium text-slate-500">
                University ID Card
              </th>
              <th className="pb-4 text-right text-sm font-medium text-slate-500">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr
                key={user.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-amber-100">
                      {user.avatarUrl ? (
                        <img
                          src={getImageKitUrl(user.avatarUrl)}
                          alt={user.fullName}
                          className="size-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex size-full items-center justify-center text-sm font-semibold text-dark-400">
                          {getInitials(user.fullName)}
                        </span>
                      )}
                    </div>
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
                <td className="py-4">
                  <UserActions userId={user.id} currentRole={user.role} />
                </td>
                <td className="py-4 text-sm text-slate-500">
                  {user.booksBorrowed}
                </td>
                <td className="py-4 text-sm text-slate-500">
                  {user.universityId}
                </td>
                <td className="py-4">
                  <ViewIdCardModal user={user} />
                </td>
                <td className="py-4 text-right">
                  <UserActions
                    userId={user.id}
                    currentRole={user.role}
                    showDelete
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[11px] text-slate-400 md:hidden">
        Scroll horizontally to see all columns
      </p>

      {totalPages > 1 && (
        <div className="mt-7 flex items-center justify-end gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <a
                key={pageNum}
                href={`/admin/users?page=${pageNum}${query ? `&query=${query}` : ""}`}
                className={`flex size-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  pageNum === currentPage
                    ? "bg-primary-admin text-white"
                    : "bg-light-300 text-dark-400 hover:bg-light-400"
                }`}
              >
                {pageNum}
              </a>
            ),
          )}
        </div>
      )}
    </section>
  );
};

export default UsersPage;
