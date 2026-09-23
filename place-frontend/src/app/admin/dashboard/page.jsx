import { BookingsChart } from "@/components/admin/dashboard/BookingsChart";
import { ClientLocations } from "@/components/admin/dashboard/ClientLocations";
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";
import { KpiCards } from "@/components/admin/dashboard/KpiCards";
import { PlatformPerformance } from "@/components/admin/dashboard/PlatformPerformance";
import { PromoBanner } from "@/components/admin/dashboard/PromoBanner";
import { RatingSummary } from "@/components/admin/dashboard/RatingSummary";
import { RecentLeads } from "@/components/admin/dashboard/RecentLeads";
import { TopProperties } from "@/components/admin/dashboard/TopProperties";
import { VisitsChart } from "@/components/admin/dashboard/VisitsChart";
import { getDashboardData } from "@/services/dashboard";
import { getCurrentUser } from "@/services/session";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [user, data] = await Promise.all([getCurrentUser(), getDashboardData()]);

  return (
    <>
      <DashboardHeader firstName={user.name.split(" ")[0]} period={data.period} />

      <KpiCards kpis={data.kpis} />

      <section className="grid gap-4 lg:grid-cols-2">
        <VisitsChart data={data.visits} />
        <TopProperties properties={data.topProperties} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1.05fr]">
        <div className="md:col-span-2 xl:col-span-1 [&>article]:h-full">
          <BookingsChart data={data.bookings} total={data.bookingsTotal} />
        </div>
        <RatingSummary data={data.rating} />
        <ClientLocations locations={data.locations} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-[2.2fr_1fr_1fr]">
        <div className="md:col-span-2 xl:col-span-1 [&>article]:h-full">
          <RecentLeads leads={data.recentLeads} />
        </div>
        <PlatformPerformance metrics={data.platform} />
        <PromoBanner />
      </section>
    </>
  );
}
