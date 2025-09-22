import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { AlertTriangle, XCircle, AlertCircle, Clock, TrendingUp } from "lucide-react";

interface SlaMetricsCardProps {
  summary: {
    total: number;
    warning: number;
    breached: number;
    reescalated: number;
    avgTimeInState: number;
  };
  loading?: boolean;
}

export function SlaMetricsCard({ summary, loading = false }: SlaMetricsCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">SLA Status</CardTitle>
          <CardDescription>Onboarding SLA metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="animate-pulse h-4 w-20 bg-muted rounded" />
            <div className="animate-pulse h-4 w-16 bg-muted rounded" />
            <div className="animate-pulse h-4 w-24 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { total, warning, breached, reescalated, avgTimeInState } = summary;
  const healthy = total - warning - breached - reescalated;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          SLA Status
        </CardTitle>
        <CardDescription>Onboarding SLA metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-green-100 text-green-800">
              {healthy}
            </Badge>
            <span className="text-xs text-muted-foreground">Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {warning}
            </Badge>
            <span className="text-xs text-muted-foreground">Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="bg-red-100 text-red-800">
              {breached}
            </Badge>
            <span className="text-xs text-muted-foreground">Breached</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="bg-red-200 text-red-900">
              {reescalated}
            </Badge>
            <span className="text-xs text-muted-foreground">Re-escalated</span>
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Avg. Time in State</span>
            <span className="text-xs font-medium">{avgTimeInState.toFixed(1)}h</span>
          </div>
        </div>

        {total > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Health Rate</span>
              <span className="text-xs font-medium">
                {Math.round((healthy / total) * 100)}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
