import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell, SyncBanner } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { usePractice } from "@/lib/practice-store";
import { agingTotal, currency, pctChange } from "@/data/practices";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Practice Dashboard — Pepper" },
      {
        name: "description",
        content:
          "Live month-to-date view of sessions, estimated revenue, insurance aging, new patients and cancellations for behavioral health practices.",
      },
      { property: "og:title", content: "Practice Dashboard — Pepper" },
      {
        property: "og:description",
        content:
          "Live month-to-date view of sessions, estimated revenue, insurance aging and cancellations.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { practice, rate, setRate } = usePractice();
  const c = practice.current;
  const p = practice.previous;

  const estRevenue = c.sessions * rate;
  const prevRevenue = p.sessions * practice.defaultRate;
  const aging = agingTotal(c.aging);

  const agingData = [
    { bucket: "0-30", amount: c.aging.d0_30 },
    { bucket: "31-60", amount: c.aging.d31_60 },
    { bucket: "61-90", amount: c.aging.d61_90 },
    { bucket: "90+", amount: c.aging.d90_plus },
  ];

  const trend = practice.history.map((h) => ({ ...h, revenue: h.sessions * rate }));

  return (
    <AppShell>
      <SyncBanner />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{practice.name}</h1>
          <p className="text-sm text-muted-foreground">
            Month-to-date performance, pulled from {practice.ehr}.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/onboarding">View onboarding status</Link>
        </Button>
      </div>

      <Card className="mb-6 border-primary/25 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">Estimated revenue</CardTitle>
          <CardDescription>
            {practice.ehr} reports session counts but not total charges billed, so revenue is
            estimated from median billing per session.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-[minmax(0,320px)_1fr] md:items-center">
          <div>
            <p className="text-4xl font-semibold tabular-nums text-foreground">
              {currency(estRevenue)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {c.sessions.toLocaleString()} sessions × {currency(rate)} median
            </p>
            <Badge variant="secondary" className="mt-3">
              {Math.round(pctChange(estRevenue, prevRevenue))}% vs last month
            </Badge>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Median billing per session</span>
              <span className="tabular-nums text-muted-foreground">{currency(rate)}</span>
            </div>
            <Slider
              value={[rate]}
              min={120}
              max={350}
              step={5}
              onValueChange={(v) => setRate(v[0] ?? rate)}
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>$120</span>
              <span>$350</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Sessions held"
          value={c.sessions.toLocaleString()}
          change={pctChange(c.sessions, p.sessions)}
          sublabel="vs last month"
        />
        <MetricCard
          label="Insurance aging"
          value={currency(aging)}
          change={pctChange(aging, p.agingTotal)}
          inverse
          sublabel={`${currency(c.aging.d90_plus)} over 90 days`}
        />
        <MetricCard
          label="Patient balances"
          value={currency(c.patientBalances)}
          change={pctChange(c.patientBalances, p.patientBalances)}
          inverse
          sublabel="outstanding AR"
        />
        <MetricCard
          label="New patients onboarded"
          value={String(c.newPatientsOnboarded)}
          change={pctChange(c.newPatientsOnboarded, p.newPatientsOnboarded)}
          sublabel="vs last month"
        />
        <MetricCard
          label="New patient appointments"
          value={String(c.newPatientAppointments)}
          change={pctChange(c.newPatientAppointments, p.newPatientAppointments)}
          sublabel="booked this month"
        />
        <MetricCard
          label="Patient cancellations"
          value={String(c.patientCancellations)}
          change={pctChange(c.patientCancellations, p.patientCancellations)}
          inverse
          sublabel="all patient-initiated"
        />
        <MetricCard
          label="No-shows / late cancels"
          value={`${c.noShows} / ${c.lateCancellations}`}
          change={pctChange(
            c.noShows + c.lateCancellations,
            p.noShows + p.lateCancellations,
          )}
          inverse
          sublabel={`${currency((c.noShows + c.lateCancellations) * rate)} at risk`}
        />
        <MetricCard
          label="Therapist-canceled"
          value={String(c.therapistCancellations)}
          change={pctChange(c.therapistCancellations, p.therapistCancellations)}
          inverse
          sublabel="tracked separately"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Sessions and estimated revenue</CardTitle>
            <CardDescription>Last six months at the current median rate.</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ left: 8, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  formatter={(value: number, name) =>
                    name === "revenue" ? currency(value) : value
                  }
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  fill="url(#rev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Insurance aging</CardTitle>
            <CardDescription>Outstanding claims by days since submission.</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingData} margin={{ left: 8, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="bucket" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  formatter={(value: number) => currency(value)}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                  }}
                />
                <Bar dataKey="amount" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
