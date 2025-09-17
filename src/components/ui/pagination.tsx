
"use client";

import Link from 'next/link';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

const Pagination = ({
  totalPages,
  currentPage,
  basePath,
  className,
}: {
  totalPages: number;
  currentPage: number;
  basePath: string;
  className?: string;
}) => {
  const getPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (page > 1) {
      params.set('page', page.toString());
    }
    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  const getPaginationItems = () => {
    const items: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      items.push(1);
      if (currentPage > 3) {
        items.push('ellipsis');
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        items.push(i);
      }
      if (currentPage < totalPages - 2) {
        items.push('ellipsis');
      }
      items.push(totalPages);
    }
    return items;
  };

  const paginationItems = getPaginationItems();

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
    >
      <ul className="flex flex-wrap items-center gap-1">
        <li>
          <PaginationLink
            aria-label="Go to previous page"
            href={getPageUrl(currentPage - 1)}
            className={cn(currentPage === 1 && 'pointer-events-none opacity-50')}
            scroll={false}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </PaginationLink>
        </li>

        {paginationItems.map((item, index) =>
          item === 'ellipsis' ? (
            <li key={`ellipsis-${index}`}>
              <span className="flex h-9 w-9 items-center justify-center">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More pages</span>
              </span>
            </li>
          ) : (
            <li key={item}>
              <PaginationLink
                href={getPageUrl(item)}
                isActive={currentPage === item}
                scroll={false}
              >
                {item}
              </PaginationLink>
            </li>
          )
        )}

        <li>
          <PaginationLink
            aria-label="Go to next page"
            href={getPageUrl(currentPage + 1)}
            className={cn(currentPage === totalPages && 'pointer-events-none opacity-50')}
            scroll={false}
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </PaginationLink>
        </li>
      </ul>
    </nav>
  );
};

const PaginationLink = ({
  className,
  isActive,
  children,
  href,
  ...props
}: {
  className?: string;
  isActive?: boolean;
  children: React.ReactNode;
  href: string;
  [key: string]: any;
}) => (
  <Link
    href={href}
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? 'outline' : 'ghost',
        size: 'icon',
      }),
      'gap-1',
      className,
      // Adjust size for "Previous" and "Next"
      (children as React.ReactElement)?.props?.children?.[1] && 'px-4 h-9 w-auto'
    )}
    {...props}
  >
    {children}
  </Link>
);
PaginationLink.displayName = 'PaginationLink';

export { Pagination };
