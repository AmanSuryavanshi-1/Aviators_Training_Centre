'use client';

import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  width: number;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface VirtualizedTableProps {
  data: any[];
  columns: Column[];
  height?: number;
  itemHeight?: number;
  loading?: boolean;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  title?: string;
  description?: string;
}

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    items: any[];
    columns: Column[];
    onSort?: (column: string, direction: 'asc' | 'desc') => void;
    sortColumn?: string;
    sortDirection?: 'asc' | 'desc';
  };
}

const Row: React.FC<RowProps> = ({ index, style, data }) => {
  const { items, columns } = data;
  const item = items[index];

  if (!item) {
    return (
      <div style={style} className="flex items-center justify-center">
        <div className="animate-pulse bg-muted h-8 w-full rounded"></div>
      </div>
    );
  }

  return (
    <div style={style} className="flex border-b border-border">
      {columns.map((column) => (
        <div
          key={column.key}
          className="flex items-center px-4 py-2 text-sm"
          style={{ width: column.width, minWidth: column.width }}
        >
          {column.render ? column.render(item[column.key], item) : item[column.key]}
        </div>
      ))}
    </div>
  );
};

const HeaderRow: React.FC<{
  columns: Column[];
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}> = ({ columns, onSort, sortColumn, sortDirection }) => {
  const handleSort = useCallback((column: Column) => {
    if (!column.sortable || !onSort) return;
    
    const newDirection = 
      sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(column.key, newDirection);
  }, [onSort, sortColumn, sortDirection]);

  return (
    <div className="flex border-b border-border bg-muted/50 font-medium">
      {columns.map((column) => (
        <div
          key={column.key}
          className="flex items-center px-4 py-3 text-sm"
          style={{ width: column.width, minWidth: column.width }}
        >
          {column.sortable ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 font-medium hover:bg-transparent"
              onClick={() => handleSort(column)}
            >
              {column.label}
              {sortColumn === column.key ? (
                sortDirection === 'asc' ? (
                  <ChevronUp className="ml-1 h-3 w-3" />
                ) : (
                  <ChevronDown className="ml-1 h-3 w-3" />
                )
              ) : (
                <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
              )}
            </Button>
          ) : (
            column.label
          )}
        </div>
      ))}
    </div>
  );
};

export default function VirtualizedTable({
  data,
  columns,
  height = 400,
  itemHeight = 48,
  loading = false,
  onSort,
  sortColumn,
  sortDirection,
  title,
  description
}: VirtualizedTableProps) {
  const memoizedData = useMemo(() => ({
    items: data,
    columns,
    onSort,
    sortColumn,
    sortDirection
  }), [data, columns, onSort, sortColumn, sortDirection]);

  const totalWidth = useMemo(() => 
    columns.reduce((sum, col) => sum + col.width, 0), 
    [columns]
  );

  if (loading) {
    return (
      <Card>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-muted h-12 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
            <Badge variant="secondary">{data.length.toLocaleString()} items</Badge>
          </CardTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div style={{ width: totalWidth, minWidth: '100%' }}>
          <HeaderRow
            columns={columns}
            onSort={onSort}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
          />
          
          {data.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              No data available
            </div>
          ) : (
            <List
              height={height}
              itemCount={data.length}
              itemSize={itemHeight}
              itemData={memoizedData}
              width="100%"
            >
              {Row}
            </List>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Utility function to create common column configurations
export const createAnalyticsColumns = (): Column[] => [
  {
    key: 'timestamp',
    label: 'Time',
    width: 150,
    sortable: true,
    render: (value) => new Date(value?.toDate?.() || value).toLocaleString()
  },
  {
    key: 'source',
    label: 'Source',
    width: 120,
    sortable: true,
    render: (value) => (
      <Badge variant="outline">
        {value?.source || 'Unknown'}
      </Badge>
    )
  },
  {
    key: 'event',
    label: 'Event',
    width: 100,
    sortable: true,
    render: (value) => (
      <Badge variant={value?.type === 'conversion' ? 'default' : 'secondary'}>
        {value?.type || 'Unknown'}
      </Badge>
    )
  },
  {
    key: 'page',
    label: 'Page',
    width: 200,
    sortable: true,
    render: (value) => (
      <span className="truncate" title={value?.path || value}>
        {value?.path || value || 'Unknown'}
      </span>
    )
  },
  {
    key: 'device',
    label: 'Device',
    width: 80,
    sortable: true,
    render: (value) => (
      <Badge variant="outline" className="text-xs">
        {value?.type || 'Unknown'}
      </Badge>
    )
  },
  {
    key: 'validation',
    label: 'Valid',
    width: 80,
    sortable: true,
    render: (value) => (
      <Badge variant={value?.isValid ? 'default' : 'destructive'}>
        {value?.isValid ? 'Yes' : 'No'}
      </Badge>
    )
  }
];

export const createJourneyColumns = (): Column[] => [
  {
    key: 'startTime',
    label: 'Started',
    width: 150,
    sortable: true,
    render: (value) => new Date(value?.toDate?.() || value).toLocaleString()
  },
  {
    key: 'entry',
    label: 'Entry Source',
    width: 120,
    sortable: true,
    render: (value) => (
      <Badge variant="outline">
        {value?.source?.source || 'Unknown'}
      </Badge>
    )
  },
  {
    key: 'duration',
    label: 'Duration',
    width: 100,
    sortable: true,
    render: (value) => {
      const minutes = Math.floor(value / 60);
      const seconds = value % 60;
      return `${minutes}m ${seconds}s`;
    }
  },
  {
    key: 'pageViews',
    label: 'Pages',
    width: 80,
    sortable: true,
    render: (value) => value || 0
  },
  {
    key: 'outcome',
    label: 'Outcome',
    width: 120,
    sortable: true,
    render: (value) => (
      <Badge variant={value?.type === 'conversion' ? 'default' : 'secondary'}>
        {value?.type || 'Unknown'}
      </Badge>
    )
  },
  {
    key: 'validation',
    label: 'Valid',
    width: 80,
    sortable: true,
    render: (value) => (
      <Badge variant={value?.isValid ? 'default' : 'destructive'}>
        {value?.isValid ? 'Yes' : 'No'}
      </Badge>
    )
  }
];

export const createTrafficSourceColumns = (): Column[] => [
  {
    key: 'source',
    label: 'Source',
    width: 150,
    sortable: true,
    render: (value) => (
      <Badge variant="outline">
        {value || 'Unknown'}
      </Badge>
    )
  },
  {
    key: 'category',
    label: 'Category',
    width: 120,
    sortable: true,
    render: (value) => (
      <Badge variant="secondary">
        {value || 'Unknown'}
      </Badge>
    )
  },
  {
    key: 'sessions',
    label: 'Sessions',
    width: 100,
    sortable: true,
    render: (value) => (value || 0).toLocaleString()
  },
  {
    key: 'conversions',
    label: 'Conversions',
    width: 100,
    sortable: true,
    render: (value) => (value || 0).toLocaleString()
  },
  {
    key: 'conversionRate',
    label: 'Conv. Rate',
    width: 100,
    sortable: true,
    render: (value, row) => {
      const rate = row.conversions && row.sessions 
        ? (row.conversions / row.sessions) * 100 
        : 0;
      return (
        <Badge variant={rate > 2 ? 'default' : 'secondary'}>
          {rate.toFixed(2)}%
        </Badge>
      );
    }
  },
  {
    key: 'authenticity',
    label: 'Confidence',
    width: 100,
    sortable: true,
    render: (value) => (
      <Badge variant={value?.confidenceScore > 80 ? 'default' : 'destructive'}>
        {value?.confidenceScore || 0}%
      </Badge>
    )
  }
];