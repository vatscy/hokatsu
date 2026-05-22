interface Props {
  className?: string;
}

export function PencilIcon({ className }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M16.862 4.487a2.06 2.06 0 1 1 2.915 2.914L7.5 19.677l-4 1 1-4z" />
      <path d="m15 6 3 3" />
    </svg>
  );
}
