// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

"use client";

interface MaterialIconProps {
  icon: string;
  className?: string;
  filled?: boolean;
  size?: number;
  weight?: number;
}

export function MaterialIcon({
  icon,
  className = "",
  filled = false,
  size = 24,
  weight = 400,
}: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined select-none ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}`,
      }}
    >
      {icon}
    </span>
  );
}
