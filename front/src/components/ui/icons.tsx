import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base(props: IconProps) {
  const { size = 18, ...rest } = props;
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };
}

export function HomeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1H10v-5.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20h3.5a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function MealsIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 3v7a2 2 0 0 0 2 2v9" />
      <path d="M6 3v5M9 3v5" />
      <path d="M18 3c-1.7 0-3 2-3 5.5S16.3 13 18 13v9" />
    </svg>
  );
}

export function ItemsIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.96 19a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.96a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 8.96 4.6a1.7 1.7 0 0 0 1.04-1.56V3a2 2 0 1 1 4 0v.09c0 .69.4 1.32 1.04 1.56.66.27 1.42.13 1.94-.36l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.36 1.94c.27.6.86 1 1.52 1H21a2 2 0 1 1 0 4h-.09c-.69 0-1.3.4-1.51 1Z" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function EditIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m15 6-6 6 6 6" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.3 2.3 4.7-5.1" />
    </svg>
  );
}

export function AlertTriangleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M10.6 3.9 1.8 19a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.4 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function FlameIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 2s-6 6.5-6 11a6 6 0 0 0 12 0c0-1.7-.8-3-1.7-4.2C15.6 10 15 11 14.5 11c-.7 0-1-.9-.8-2 .2-1.2.8-2.3.8-3.6C14.5 3.5 13.2 2.4 12 2Z" />
      <path d="M9.5 15a2.5 2.5 0 0 0 5 0c0-1.2-.7-2-1.3-2.8-.3-.4-.7-.2-.7.3 0 .8-.5 1-.9.6-.3-.3-.6-.1-.6.3-.1.5-1.5.9-1.5 1.6Z" />
    </svg>
  );
}

export function ProteinIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 15c0-4 2-9 5-9 1.2 0 1.6 1 2.7 1S13.5 6 15 6c3 0 5 4 5 9-1 0-1.9-1-3-1s-1.8 1-3 1-1.8-1-3-1-2 1-3 1-2-1-4-1Z" />
    </svg>
  );
}

export function CarbIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 13c3-6 13-11 16-8s-2 13-8 16C7 24 1 19 4 13Z" />
      <path d="M8 15c2-3 5-6 8-8" />
    </svg>
  );
}

export function FatIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3c3 3 7 7.5 7 11.5a7 7 0 1 1-14 0C5 10.5 9 6 12 3Z" />
    </svg>
  );
}

export function UtensilsSmallIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 3v6a2 2 0 0 0 2 2v10" />
      <path d="M5 3v4M8 3v4" />
      <path d="M16 3c-1.5 0-2.5 1.8-2.5 5S14.5 12 16 12v9" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.3-3.5 4-5.5 7-5.5s5.7 2 7 5.5" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

export function InboxIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 12h4l2 3h4l2-3h4" />
      <path d="M5.5 5h13l2 7v6a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3.5 18v-6Z" />
    </svg>
  );
}
