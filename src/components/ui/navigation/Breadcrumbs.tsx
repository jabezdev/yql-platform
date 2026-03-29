/**
 * Breadcrumbs — hierarchical location trail
 *
 * Light: links `text-brand-lightBlue`; separator `text-brand-blue/30`; current `font-bold text-brand-blue`.
 * Dark:  links `text-white/55`; separator `text-white/25`; current `text-white font-bold`.
 *
 * Import via: import { Breadcrumbs } from '@/design'
 */

import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    onClick?: () => void;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    /**
     * When `true`, applies dark-surface colour tokens:
     * links `text-white/55`; separator `text-white/25`; current `text-white font-bold`.
     */
    dark?: boolean;
    className?: string;
}

/**
 * Breadcrumb trail. Last item is rendered as the current page (non-interactive).
 *
 * ```tsx
 * <Breadcrumbs
 *   items={[
 *     { label: 'Dashboard', onClick: () => navigate('/') },
 *     { label: 'Members', onClick: () => navigate('/members') },
 *     { label: 'Jane Doe' },
 *   ]}
 * />
 * ```
 */
export function Breadcrumbs({ items, dark = false, className = '' }: BreadcrumbsProps) {
    const linkCls = dark
        ? 'text-white/55 hover:text-white transition-colors duration-150'
        : 'text-brand-lightBlue hover:text-brand-blue transition-colors duration-150';

    const separatorCls = dark ? 'text-white/25' : 'text-brand-blue/30';

    const currentCls = dark
        ? 'text-white font-bold'
        : 'text-brand-blue font-bold';

    return (
        <nav aria-label="Breadcrumb" className={className}>
            <ol className="flex items-center flex-wrap gap-0.5">
                {items.map((item, i) => {
                    const isLast = i === items.length - 1;
                    return (
                        <li key={i} className="flex items-center gap-0.5">
                            {i > 0 && (
                                <ChevronRight
                                    size={12}
                                    className={`${separatorCls} flex-shrink-0 mx-0.5`}
                                    aria-hidden="true"
                                />
                            )}
                            {isLast ? (
                                <span
                                    className={`text-xs ${currentCls}`}
                                    aria-current="page"
                                >
                                    {item.label}
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={item.onClick}
                                    className={`text-xs ${linkCls}`}
                                >
                                    {item.label}
                                </button>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

export type { BreadcrumbsProps, BreadcrumbItem };
