import "server-only";
import { redirect } from "next/navigation";
import { aggregateOps } from "@/lib/ops";
import { getUserAndClient, isAdmin } from "@/lib/auth/server-auth";
import OpsRefresh from "./refresh";

export const dynamic = "force-dynamic";

export default async function OpsPage() {
  const { user } = await getUserAndClient();
  if (!user || !(await isAdmin(user))) redirect("/");

  const data = await aggregateOps();

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Ops Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <StatCard title="Health" value={data.ok ? "OK" : "Fail"} />
        <StatCard title="Cache-Control" value={data.cacheControl ?? "n/a"} />
        <StatCard title="Supabase" value={data.supabaseOK ? "Reachable" : "Down"} />
      </div>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Sentry (last 5)</h2>
          <OpsRefresh />
        </div>
        <ul className="divide-y rounded-lg border">
          {data.sentryIssues?.length ? (
            data.sentryIssues.map((i: any) => (
              <li key={i.id} className="p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{i.title}</span>
                  <span className="opacity-70">{i.level}</span>
                </div>
                <div className="text-xs opacity-70">{i.culprit}</div>
                <div className="text-[11px] opacity-60">
                  {i.lastSeen ? new Date(i.lastSeen).toLocaleString() : "—"}
                </div>
              </li>
            ))
          ) : (
            <li className="p-3 text-sm opacity-70">No issues or SENTRY_* not set</li>
          )}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Health payload</h2>
        <pre className="text-xs bg-black/5 p-3 rounded overflow-auto">
          {JSON.stringify(data.health, null, 2)}
        </pre>
      </section>
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  const ok = /ok|200|immutable|max-age/i.test(value);
  return (
    <div className="rounded-xl border p-4">
      <div className="text-sm opacity-70">{title}</div>
      <div className="text-lg font-semibold break-all">{value}</div>
      <div className={`mt-2 inline-flex items-center gap-2 text-xs ${ok ? "text-green-600" : "text-red-600"}`}>
        <span className={`h-2 w-2 rounded-full ${ok ? "bg-green-500" : "bg-red-500"}`} />
        {ok ? "healthy" : "check"}
      </div>
    </div>
  );
}