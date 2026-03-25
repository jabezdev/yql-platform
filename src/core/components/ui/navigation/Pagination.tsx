/**
 * Pagination — page navigator
 *
 * Light: active page `bg-brand-blue text-white` with blue iso-shadow.
 * Dark:  active page `bg-brand-yellow text-brand-blue` with black iso-shadow.
 *
 * Import via: import { Pagination } from '@/design'
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    /**
     * When `true`, applies dark-surface colour tokens:
     * active `bg-brand-yellow text-brand-blue`; dormant `bg-white/10 border-white/15`.
     */
    dark?: boolean;
    className?: string;
}

function buildPageList(page: number, total: number): (number | '…')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '…')[] = [1];
    if (page > 3)              pages.push('…');
    for (let p = Math.max(2, page - 1); p <= Math.min(total - 1, page + 1); p++) pages.push(p);
    if (page < total - 2)      pages.push('…');
    pages.push(total);
    return pages;
}

/**
 * Page navigator. Renders numbered page buttons with Prev / Next controls.
 *
 * ```tsx
 * <Pagination page={page} totalPages={10} onPageChange={setPage} />
 * <Pagination page={page} totalPages={10} onPageChange={setPage} dark />
 * ```
 */
export function Pagination({ page, totalPages, onPageChange, dark = false, className = '' }: PaginationProps) {
    const pages = buildPageList(page, totalPages);

    const activeCls = dark
        ? 'bg-brand-yellow border-brand-yellow text-brand-blue shadow-[2px_2px_0px_0px_rgba(0,0,0,0.35)] font-extrabold'
        : 'bg-brand-blue border-brand-blue text-white shadow-[2px_2px_0px_0px_rgba(10,22,48,0.4)] font-extrabold';

    const dormantCls = dark
        ? 'bg-white/10 border-white/15 text-white/65 hover:bg-white/20 hover:text-white'
        : 'bg-white border-brand-blue/15 text-brand-blue/65 hover:bg-brand-bgLight hover:text-brand-blue';

    const navCls = dark
        ? 'bg-white/10 border-white/15 text-white/65 hover:bg-white/20 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'
        : 'bg-white border-brand-blue/15 text-brand-blue/65 hover:bg-brand-bgLight hover:text-brand-blue disabled:opacity-30 disabled:cursor-not-allowed';

    return (
        <div className={`flex items-center gap-1.5 ${className}`} role="navigation" aria-label="Pagination">
            {/* Prev */}
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                aria-label="Previous page"
                className={[
                    'w-8 h-8 flex items-center justify-center rounded-tl-lg rounded-br-lg border-2 transition-all duration-150',
                    navCls,
                ].join(' ')}
            >
                <ChevronLeft size={14} aria-hidden="true" />
            </button>

            {/* Pages */}
            {pages.map((p, i) =>
                p === '…' ? (
                    <span
                        key={`ellipsis-${i}`}
                        className={`text-xs px-1 ${dark ? 'text-white/35' : 'text-brand-blue/35'}`}
                        aria-hidden="true"
                    >
                        …
                    </span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        aria-label={`Page ${p}`}
                        aria-current={p === page ? 'page' : undefined}
                        className={[
                            'w-8 h-8 flex items-center justify-center rounded-tl-lg rounded-br-lg border-2 text-xs transition-all duration-150',
                            p === page ? activeCls : dormantCls,
                        ].join(' ')}
                    >
                        {p}
                    </button>
                )
            )}

            {/* Next */}
            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                aria-label="Next page"
                className={[
                    'w-8 h-8 flex items-center justify-center rounded-tl-lg rounded-br-lg border-2 transition-all duration-150',
                    navCls,
                ].join(' ')}
            >
                <ChevronRight size={14} aria-hidden="true" />
            </button>
        </div>
    );
}

export type { PaginationProps };
