type IconProps = {
  className?: string;
};

function IconBase({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-cyan-300 ${className ?? ""}`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-current">
        {children}
      </svg>
    </span>
  );
}

export function DollarIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 3v18M16 7.5c0-1.657-1.79-3-4-3s-4 1.343-4 3 1.79 3 4 3 4 1.343 4 3-1.79 3-4 3-4-1.343-4-3" strokeWidth="1.6" />
    </IconBase>
  );
}

export function GaugeIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M4 14a8 8 0 1 1 16 0" strokeWidth="1.6" />
      <path d="M12 14l4-4" strokeWidth="1.6" />
      <circle cx="12" cy="14" r="1" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" strokeWidth="1.6" />
    </IconBase>
  );
}

export function FileListIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M7 4h8l3 3v13H7z" strokeWidth="1.6" />
      <path d="M10 11h6M10 15h6M10 19h6" strokeWidth="1.6" />
    </IconBase>
  );
}

export function AlertIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 4l8 14H4L12 4Z" strokeWidth="1.6" />
      <path d="M12 9v4M12 16h.01" strokeWidth="1.6" />
    </IconBase>
  );
}

export function SparkIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 3l1.8 4.6L18 9.4l-4.2 1.8L12 16l-1.8-4.8L6 9.4l4.2-1.8L12 3Z" strokeWidth="1.6" />
    </IconBase>
  );
}

export function BoltIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M13 3L6 13h5l-1 8 7-10h-5l1-8Z" strokeWidth="1.6" />
    </IconBase>
  );
}

