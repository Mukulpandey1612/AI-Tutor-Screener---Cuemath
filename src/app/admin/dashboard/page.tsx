import { prisma } from "@/lib/prisma";
import Link from "next/link";
import LogoutButton from '@/components/dashboard/LogoutButton'

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboard() {
  const interviews = await prisma.interview.findMany({
    include: { candidate: true },
    orderBy: { createdAt: "desc" },
  });

  const completed = interviews.filter((i) => i.status === "COMPLETED").length;
  const inProgress = interviews.filter((i) => i.status !== "COMPLETED").length;
  const thisWeek = interviews.filter((i) => {
    const d = new Date(i.createdAt);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  }).length;

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const avatarColors = [
    { bg: "#FAEEDA", text: "#633806" },
    { bg: "#E1F5EE", text: "#085041" },
    { bg: "#EEEDFE", text: "#3C3489" },
    { bg: "#FAECE7", text: "#712B13" },
    { bg: "#E6F1FB", text: "#0C447C" },
  ];

  return (
    <div className="min-h-screen bg-[#F9F8F5] p-6 sm:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-1 font-mono">
              Cuemath Intelligence
            </p>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              Recruiter dashboard
            </h1>
            <p className="text-sm text-gray-500">
              AI screening results and candidate dossiers
            </p>
          </div>
          
          {/* ✅ Swapped <a> tag for the custom Client-Side LogoutButton */}
          <div className="flex items-center gap-4">
            <LogoutButton />
          </div>
        </header>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            {
              label: "Total sessions",
              value: interviews.length,
              color: "text-gray-900",
            },
            { label: "Completed", value: completed, color: "text-emerald-600" },
            {
              label: "In progress",
              value: inProgress,
              color: "text-amber-500",
            },
            { label: "This week", value: thisWeek, color: "text-gray-900" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-gray-100 p-4"
            >
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className={`text-2xl font-semibold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-3">Candidate</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {interviews.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-16 text-center text-gray-400 text-sm italic"
                  >
                    No screening sessions found.
                  </td>
                </tr>
              ) : (
                interviews.map((interview, i) => {
                  const isCompleted = interview.status === "COMPLETED";
                  const avatar = avatarColors[i % avatarColors.length];

                  return (
                    <tr
                      key={interview.id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0"
                            style={{
                              background: avatar.bg,
                              color: avatar.text,
                            }}
                          >
                            {initials(interview.candidate.name)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {interview.candidate.name}
                            </p>
                            <p className="text-xs text-gray-400 font-mono">
                              {interview.candidate.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-gray-500">
                        {new Date(interview.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border ${
                            isCompleted
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-amber-50 text-amber-600 border-amber-100"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${isCompleted ? "bg-emerald-500" : "bg-amber-400"}`}
                          />
                          {isCompleted ? "Completed" : "In progress"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {isCompleted ? (
                          <Link href={`/admin/results/${interview.id}`}>
                            <button className="text-xs px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-orange-500 hover:text-white transition-all shadow-sm">
                              View Report
                            </button>
                          </Link>
                        ) : (
                          <div className="flex justify-end">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg opacity-60">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                Processing...
                              </span>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <div className="px-6 py-3 border-t border-gray-100 flex justify-between items-center">
            <p className="text-xs text-gray-400">
              Showing {interviews.length} sessions
            </p>
            <p className="text-[10px] font-mono text-gray-300 uppercase tracking-widest">
              Secure recruiter access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}