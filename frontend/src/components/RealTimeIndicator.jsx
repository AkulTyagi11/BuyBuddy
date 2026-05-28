import { Wifi, WifiOff, RefreshCcw } from 'lucide-react';

const statusConfig = {
  connected: {
    label: 'Live',
    icon: Wifi,
    className: 'text-brand-primary',
    dot: 'bg-brand-primary',
  },
  connecting: {
    label: 'Syncing',
    icon: RefreshCcw,
    className: 'text-semantic-warning',
    dot: 'bg-semantic-warning',
  },
  disconnected: {
    label: 'Offline',
    icon: WifiOff,
    className: 'text-semantic-error',
    dot: 'bg-semantic-error',
  },
};

export default function RealTimeIndicator({ status = 'disconnected' }) {
  const config = statusConfig[status] || statusConfig.disconnected;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border border-border-default bg-surface px-3 py-1 text-xs font-semibold ${config.className}`}>
      <span className={`h-2 w-2 rounded-full ${config.dot}`} />
      <Icon className={`h-3.5 w-3.5 ${status === 'connecting' ? 'animate-spin' : ''}`} />
      <span>{config.label}</span>
    </div>
  );
}
