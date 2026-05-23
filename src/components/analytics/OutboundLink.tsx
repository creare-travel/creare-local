'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { trackOutboundClick } from '@/lib/analytics/tracking';

interface OutboundLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  trackingLabel: string;
  trackingSource?: string;
}

export default function OutboundLink({
  href,
  trackingLabel,
  trackingSource,
  onClick,
  children,
  ...rest
}: OutboundLinkProps) {
  const pathname = usePathname();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    trackOutboundClick({
      outbound_url: href,
      label: trackingLabel,
      source: trackingSource,
      page_path: pathname,
    });

    onClick?.(event);
  };

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
