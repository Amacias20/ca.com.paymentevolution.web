import type { GridFilterChangeEvent, GridPageChangeEvent, GridSortChangeEvent } from '@progress/kendo-react-grid';
import type { CompositeFilterDescriptor, SortDescriptor } from '@progress/kendo-data-query';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import React, { useImperativeHandle, useRef } from 'react';
import { Loader } from '@progress/kendo-react-indicators';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';
import { useTranslation } from 'react-i18next';

export interface ColumnDef {
  field: string;
  title: string;
  width?: string | number;
  filterable?: boolean;
  sortable?: boolean;
  /** Custom data cell component — maps to GridColumn `cells.data` */
  cell?: React.ComponentType<any>;
  /** Custom header cell component — maps to GridColumn `cells.headerCell` */
  headerCell?: React.ComponentType<any>;
}


export interface ActionButton {
  label: string;
  icon?: string;
  themeColor?: 'primary' | 'base' | 'error' | 'warning' | 'success' | 'info';
  fillMode?: 'solid' | 'outline' | 'flat';
  onClick: () => void;
  disabled?: boolean;
  id?: string;
}

export interface DataTableProps {
  /** Data array to display */
  data: any[];
  /** Total records count (for server-side pagination) */
  total?: number;
  /** Column definitions */
  columns: ColumnDef[];
  /** Show loading overlay */
  loading?: boolean;
  /** Enable server-side pagination */
  pageable?: boolean;
  /** Page sizes available */
  pageSizes?: number[];
  /** Current skip (for controlled pagination) */
  skip?: number;
  /** Current take (for controlled pagination) */
  take?: number;
  /** Called when page changes */
  onPageChange?: (skip: number, take: number) => void;
  /** Enable column sorting */
  sortable?: boolean;
  /** Current sort state (controlled) */
  sort?: SortDescriptor[];
  /** Called when sort changes */
  onSortChange?: (sort: SortDescriptor[]) => void;
  /** Enable column filtering */
  filterable?: boolean;
  /** Current filter state (controlled) */
  filter?: CompositeFilterDescriptor | null;
  /** Called when filter changes */
  onFilterChange?: (filter: CompositeFilterDescriptor | null) => void;
  /** Search bar placeholder */
  searchPlaceholder?: string;
  /** Current search text (controlled) */
  search?: string;
  /** Called when search changes */
  onSearchChange?: (value: string) => void;
  /** Optional content rendered at the left of the toolbar (e.g. DateRangePicker) */
  toolbarPrefix?: React.ReactNode;
  /** Action buttons displayed in the toolbar */
  actions?: ActionButton[];
  /** Height of the grid (default: auto) */
  height?: string | number;
  /** Custom empty text */
  emptyText?: string;
  /** CSS class name */
  className?: string;
  /** Accent color for the count badge (hex/rgba) */
  badgeColor?: string;
  /** Accent border color */
  badgeBorderColor?: string;
  /** Text color for count badge */
  badgeTextColor?: string;
  /** Label shown in the count badge (next to total number) */
  badgeLabel?: string;
}

// ─── DataTable Ref ────────────────────────────────────────────────────────────

export interface DataTableRef {
  /** Returns the current filtered/displayed data */
  getData: () => any[];
}

// ─── Component ────────────────────────────────────────────────────────────────

const DataTable = React.forwardRef<DataTableRef, DataTableProps>(
  (
    {
      data,
      total,
      columns,
      loading = false,
      pageable = true,
      pageSizes = [10, 25, 50],
      skip = 0,
      take = 10,
      onPageChange,
      sortable = true,
      sort = [],
      onSortChange,
      filterable = true,
      filter = null,
      onFilterChange,
      searchPlaceholder,
      search = '',
      onSearchChange,
      toolbarPrefix,
      actions = [],
      height,
      className = '',
      badgeColor = 'rgba(91,94,244,0.12)',
      badgeBorderColor = 'rgba(91,94,244,0.25)',
      badgeTextColor = '#7b7ef9',
      badgeLabel,
    },
    ref
  ) => {
    const { t } = useTranslation();
    const internalRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      getData: () => data,
    }));

    const handlePageChange = (e: GridPageChangeEvent) => {
      onPageChange?.(e.page.skip, e.page.take);
    };

    const handleSortChange = (e: GridSortChangeEvent) => {
      onSortChange?.(e.sort);
    };

    const handleFilterChange = (e: GridFilterChangeEvent) => {
      onFilterChange?.(e.filter);
    };

    const displayTotal = total ?? data.length;
    const resolvedLabel = badgeLabel ?? t('common.total');
    const resolvedPlaceholder = searchPlaceholder ?? `🔍  ${t('common.search')}...`;

    const hasToolbar = toolbarPrefix || onSearchChange || actions.length > 0;

    return (
      <div
        ref={internalRef}
        className={`section-card ${className}`.trim()}
        style={{ position: 'relative' }}
      >
        {hasToolbar && (
          <div className="grid-toolbar">
            {toolbarPrefix}
            {onSearchChange && (
              <Input
                placeholder={resolvedPlaceholder}
                value={search}
                onChange={e => onSearchChange(String(e.value ?? ''))}
                style={{ width: '260px' }}
              />
            )}
            <div className="grid-toolbar-spacer" />
            {displayTotal > 0 && (
              <div
                style={{
                  padding: '0.25rem 0.75rem',
                  background: badgeColor,
                  border: `1px solid ${badgeBorderColor}`,
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: badgeTextColor,
                  whiteSpace: 'nowrap',
                }}
              >
                {displayTotal} {resolvedLabel}
              </div>
            )}
            {actions.map((action, idx) => (
              <Button
                key={action.id ?? idx}
                id={action.id}
                themeColor={action.themeColor ?? 'base'}
                fillMode={action.fillMode ?? 'outline'}
                onClick={action.onClick}
                disabled={action.disabled || loading}
              >
                {action.icon && `${action.icon} `}{action.label}
              </Button>
            ))}
          </div>
        )}
      <div className="section-card-body no-pad" style={{ position: 'relative' }}>
          {loading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-base)',
                opacity: 0.7,
                zIndex: 10,
                borderRadius: '0 0 12px 12px',
              }}
            >
              <Loader size="large" themeColor="primary" />
            </div>
          )}
          <div style={{ overflowX: 'auto', minWidth: 0 }}>
            <Grid
              data={data}
              total={displayTotal}
              skip={skip}
              take={take}
              pageable={
                pageable
                  ? { pageSizes, info: true, buttonCount: 5 }
                  : false
              }
              sortable={sortable}
              sort={sort}
              filterable={filterable}
              filter={filter ?? undefined}
              onPageChange={handlePageChange}
              onSortChange={handleSortChange}
              onFilterChange={handleFilterChange}
              scrollable="none"
              style={{
                border: 'none',
                height: height,
                width: '100%',
              }}
            >
              {columns.map(col => (
                <GridColumn
                  key={col.field}
                  field={col.field}
                  title={col.title}
                  width={col.width}
                  filterable={col.filterable ?? true}
                  sortable={col.sortable ?? true}
                  cells={{
                    data: col.cell,
                    headerCell: col.headerCell,
                  }}
                />
              ))}
            </Grid>
          </div>
        </div>
      </div>
    );
  }
);

DataTable.displayName = 'DataTable';

export default DataTable;