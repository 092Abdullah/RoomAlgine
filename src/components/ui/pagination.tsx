
"use client";

import Link from 'next/link';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import React from 'react';

const Pagination = ({
  totalPages,
  currentPage,
  basePath,
  className,
}: {
  totalPages: number;
  currentPage: number;
  basePath: string; // e.g., "/gallery"
  className?: string;
}) => {
  const isMobile = useIsMobile();

  const getPageUrl = (page: number) => {
    if (page < 1 || page > totalPages) {
        return '#';
    }
    if (page === 1) {
      return basePath; // Root path for page 1
    }
    return `${basePath}/page/${page}`;
  };

  const getPaginationItems = () => {
    const items: (number | 'ellipsis')[] = [];
    const pageRangeDisplayed = 5;
    const pageCount = totalPages;

    if (pageCount <= pageRangeDisplayed) {
      for (let i = 1; i <= pageCount; i++) {
        items.push(i);
      }
    } else {
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(pageCount - 1, currentPage + 1);

      if (currentPage === 1) {
        startPage = 2;
        endPage = 3;
      }
      if (currentPage === pageCount) {
        startPage = pageCount - 2;
        endPage = pageCount - 1;
      }

      items.push(1);
      if (startPage > 2) {
        items.push('ellipsis');
      }

      for (let i = startPage; i <= endPage; i++) {
        items.push(i);
      }

      if (endPage < pageCount - 1) {
        items.push('ellipsis');
      }
      items.push(pageCount);
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
            <span className={isMobile ? 'sr-only' : ''}>Previous</span>
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
            <span className={isMobile ? 'sr-only' : ''}>Next</span>
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
}) => {
    const isPageNumber = typeof children === 'number';

    return (
        <Link
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
            buttonVariants({
                variant: isActive ? 'outline' : 'ghost',
                size: isPageNumber ? 'icon' : 'default',
            }),
            'gap-1',
            !isPageNumber && 'px-2.5 sm:px-4',
            className,
            )}
            {...props}
        >
            {children}
        </Link>
    );
};

PaginationLink.displayName = 'PaginationLink';

export { Pagination };
