import type { SVGProps } from 'react';

export function CuppingCompassLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m15.5 8.5-7 7" />
      <path d="m8.5 8.5 7 7" />
      <path d="M12 17.5c-3.038 0-5.5-2.462-5.5-5.5s2.462-5.5 5.5-5.5" />
      <path d="M12 6.5c3.038 0 5.5 2.462 5.5 5.5s-2.462 5.5-5.5 5.5" />
      <path d="M12 6.5c-1.519 1.519-.94 4.519.96 5.5" />
      <path d="M12 17.5c1.519-1.519.94-4.519-.96-5.5" />
    </svg>
  );
}
