/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Folio logo component. Typographic inline SVG that scales crisp
 * and supports custom theme colors/fill inheritance.
 */

interface FolioLogoProps {
  className?: string;
}

export default function FolioLogo({ className = "h-6 md:h-7 w-auto" }: FolioLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="0"
        y="18"
        className="font-sans font-bold text-[21px] tracking-[-0.04em] fill-current"
      >
        FOLIO
      </text>
      <circle cx="68" cy="14" r="2.5" className="fill-accent-primary" />
    </svg>
  );
}
