import { useEffect, useMemo, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import "./dataTable.css";

export type DataTableColumn<T> = {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
};

interface DataTableProps<T> {
  rows: T[];
  columns: DataTableColumn<T>[];
  getRowKey: (item: T) => string;
  loading?: boolean;
  loadingText?: string;
  emptyText?: string;
  className?: string;
  selectedRowId?: string;
  onRowClick?: (item: T) => void;
  rowsPerPage?: number;
}

function DataTable<T>({
  rows,
  columns,
  getRowKey,
  loading = false,
  loadingText = "Henter data...",
  emptyText = "Ingen data funnet.",
  className = "",
  selectedRowId,
  onRowClick,
  rowsPerPage = 6
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));

  useEffect(() => {
    setPage(1);
  }, [rows, rowsPerPage]);

  const visibleRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [page, rows, rowsPerPage]);

  const firstVisible = rows.length === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const lastVisible = Math.min(page * rowsPerPage, rows.length);

  return (
    <div className={`data-table ${className}`.trim()}>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="empty-table-cell">
                {loadingText}
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="empty-table-cell">
                {emptyText}
              </td>
            </tr>
          ) : (
            visibleRows.map((row) => {
              const rowKey = getRowKey(row);

              return (
                <tr
                  key={rowKey}
                  className={selectedRowId === rowKey ? "selected-row" : ""}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td key={column.key}>{column.render(row)}</td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <div className="data-table-footer">
        <p>
          Viser {firstVisible}-{lastVisible} av {rows.length}
        </p>

        <div className="data-table-pagination">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            aria-label="Forrige side"
          >
            {FaChevronLeft({ className: "icon" })}
          </button>

          <span>{page} / {totalPages}</span>

          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page === totalPages}
            aria-label="Neste side"
          >
            {FaChevronRight({ className: "icon" })}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;

