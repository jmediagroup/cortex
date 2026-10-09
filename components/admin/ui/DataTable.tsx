'use client';

import { Fragment, type ReactNode } from 'react';
import { cx } from './Controls';

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

/**
 * Lists on phones and tablets, a real table on desktop. Both renderings are
 * in the DOM and swapped with CSS so there is no layout jump on hydration.
 */
export function DataTable<T>({
  rows,
  rowKey,
  columns,
  mobileRow,
  onRowClick,
  minWidth,
  footer,
}: {
  rows: T[];
  rowKey: (row: T) => string;
  columns: Column<T>[];
  /**
   * A <ListRow> (or similar) for each row below the `lg` breakpoint. Without
   * it the table renders at every size (wrap it yourself if needed).
   */
  mobileRow?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  minWidth?: number;
  footer?: ReactNode;
}) {
  return (
    <>
      {mobileRow && (
        <div className="lg:hidden">
          <div className="ad-group">{rows.map((r) => <Fragment key={rowKey(r)}>{mobileRow(r)}</Fragment>)}</div>
        </div>
      )}
      <div className={mobileRow ? 'hidden lg:block' : undefined}>
        <div className="ad-group">
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]" style={minWidth ? { minWidth } : undefined}>
              <thead>
                <tr className="border-b-[0.5px] border-[var(--ad-sep-strong)]">
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      scope="col"
                      className={cx(
                        'whitespace-nowrap px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--ad-label-3)]',
                        c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left',
                      )}
                    >
                      {c.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={rowKey(r)}
                    onClick={onRowClick ? () => onRowClick(r) : undefined}
                    onKeyDown={
                      onRowClick
                        ? (e) => {
                            if (e.key === 'Enter' && e.target === e.currentTarget) onRowClick(r);
                          }
                        : undefined
                    }
                    tabIndex={onRowClick ? 0 : undefined}
                    className={cx(
                      'border-b-[0.5px] border-[var(--ad-sep)] last:border-0',
                      onRowClick && 'cursor-pointer transition-colors hover:bg-[rgba(5,76,125,0.035)] focus-visible:bg-[rgba(5,76,125,0.05)]',
                    )}
                  >
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className={cx(
                          'px-4 py-3 align-middle text-[var(--ad-label-2)]',
                          c.align === 'right' ? 'text-right tabular-nums' : c.align === 'center' ? 'text-center' : 'text-left',
                          c.className,
                        )}
                      >
                        {c.cell(r)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {footer}
        </div>
      </div>
    </>
  );
}
