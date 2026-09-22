import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  sublabel?: string;
  change?: number;
  /** true when going up is bad (cancellations, aging) */
  inverse?: boolean;
};

export function MetricCard({ label, value, sublabel, change, inverse }: Props) {
  const hasChange = typeof change === "number" && Number.isFinite(change);
  const rounded = hasChange ? Math.round(change!) : 0;
  const good = inverse ? rounded < 0 : rounded > 0;
  const Icon = rounded === 0 ? Minus : rounded > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="gap-0 py-5">
      <CardContent className="px-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">{value}</p>
        <div className="mt-2 flex items-center gap-2 text-xs">
          {hasChange && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
                rounded === 0
                  ? "bg-muted text-muted-foreground"
                  : good
                    ? "bg-success/15 text-success"
                    : "bg-destructive/10 text-destructive",
              )}
            >
              <Icon className="size-3" />
              {Math.abs(rounded)}%
            </span>
          )}
          {sublabel && <span className="text-muted-foreground">{sublabel}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
