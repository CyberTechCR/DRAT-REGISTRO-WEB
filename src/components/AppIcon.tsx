import type { SVGProps } from 'react';

export type AppIconName = 'home' | 'administration' | 'search' | 'approval' | 'reports' | 'user' | 'refresh';

const paths: Record<AppIconName, React.ReactNode> = {
  home: <><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/></>,
  administration: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h3"/><circle cx="16.5" cy="16.5" r="2.5"/><path d="m18.3 18.3 2 2"/></>,
  search: <><path d="M5 3h10l4 4v5"/><path d="M15 3v5h5M8 11h4M8 15h2"/><circle cx="15.5" cy="16.5" r="3.5"/><path d="m18 19 2.5 2.5"/></>,
  approval: <><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v5h5"/><path d="m9 15 2 2 4-5"/></>,
  reports: <><path d="M5 3h14v18H5z"/><path d="M9 17v-3M12 17v-6M15 17V8M9 7h3"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></>,
  refresh: <><path d="M20 6v5h-5"/><path d="M4 18v-5h5"/><path d="M6.1 9A7 7 0 0 1 18.8 7L20 11M4 13l1.2 4A7 7 0 0 0 18 15"/></>,
};

export function AppIcon({ name, ...props }: { name: AppIconName } & SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
