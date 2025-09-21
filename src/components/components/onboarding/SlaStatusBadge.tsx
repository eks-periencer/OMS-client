import { Badge } from "../ui/badge";
import { Clock, AlertTriangle, XCircle, AlertCircle } from "lucide-react";

interface SlaStatusBadgeProps {
  status: 'ok' | 'warning' | 'breached' | 'reescalated' | 'unknown';
  elapsedHours?: number;
  slaHours?: number;
  dueAt?: string;
  showDetails?: boolean;
}

export function SlaStatusBadge({ 
  status, 
  elapsedHours = 0, 
  slaHours = 0, 
  dueAt, 
  showDetails = false 
}: SlaStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'ok':
        return {
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: Clock,
          label: 'On Track',
          description: showDetails ? `${elapsedHours.toFixed(1)}h / ${slaHours}h` : undefined
        };
      case 'warning':
        return {
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: AlertTriangle,
          label: 'Warning',
          description: showDetails ? `${elapsedHours.toFixed(1)}h / ${slaHours}h` : undefined
        };
      case 'breached':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          label: 'Breached',
          description: showDetails ? `${elapsedHours.toFixed(1)}h / ${slaHours}h` : undefined
        };
      case 'reescalated':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-200 text-red-900 border-red-300',
          icon: AlertCircle,
          label: 'Re-escalated',
          description: showDetails ? `${elapsedHours.toFixed(1)}h / ${slaHours}h` : undefined
        };
      default:
        return {
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-600 border-gray-200',
          icon: Clock,
          label: 'Unknown',
          description: showDetails ? 'No SLA data' : undefined
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
      {config.description && (
        <span className="text-xs text-muted-foreground">
          {config.description}
        </span>
      )}
      {dueAt && showDetails && (
        <span className="text-xs text-muted-foreground">
          Due: {new Date(dueAt).toLocaleString()}
        </span>
      )}
    </div>
  );
}
