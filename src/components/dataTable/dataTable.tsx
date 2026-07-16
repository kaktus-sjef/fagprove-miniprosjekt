import { useEffect, useMemo, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import "./dataTable.css";

// Elementer inni en rad som skal få håndtere klikk/tastatur selv.
// Uten denne sjekken vil f.eks. Enter på "Handlinger" også åpne raden.
const interactiveRowSelector = [
  "button",
  "a",
  "input",
  "select",
  "textarea",
  "[role='button']",
  "[tabindex]:not(tr)"
].join(",");

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
  getRowAriaLabel?: (item: T) => string;
  tableLabel?: string;
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
  getRowAriaLabel,
  tableLabel = "Datatabell",
  rowsPerPage = 6
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const tableTopRef = useRef<HTMLDivElement | null>(null);
  const firstRowRef = useRef<HTMLTableRowElement | null>(null);
  const shouldFocusFirstRow = useRef(false);

  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));

  useEffect(() => {
    setPage(1);
  }, [rows, rowsPerPage]);

  const visibleRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [page, rows, rowsPerPage]);

  useEffect(() => {
    if (!shouldFocusFirstRow.current) return;

    // Etter sidebytte i tabellen flyttes fokus til første rad,
    // slik at tastaturbrukere ikke sendes tilbake til starten av siden.
    shouldFocusFirstRow.current = false;
    const focusTimer = window.setTimeout(() => {
      if (firstRowRef.current?.tabIndex === 0) {
        firstRowRef.current.focus();
      } else {
        tableTopRef.current?.focus();
      }
    }, 0);

    return () => window.clearTimeout(focusTimer);
  }, [page, visibleRows]);

  const firstVisible = rows.length === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const lastVisible = Math.min(page * rowsPerPage, rows.length);

  const handlePageChange = (nextPage: number) => {
    shouldFocusFirstRow.current = true;
    setPage(nextPage);
  };

  const handleRowKeyDown = (
    event: React.KeyboardEvent<HTMLTableRowElement>,
    row: T
  ) => {
    if (!onRowClick) return;

    // Hvis fokus står på en knapp/input inni raden, skal raden ikke aktiveres.
    const target = event.target as HTMLElement;
    if (target.closest(interactiveRowSelector)) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onRowClick(row);
    }
  };

  return (
    <div
      className={`data-table ${className}`.trim()}
      ref={tableTopRef}
      tabIndex={-1}
      aria-label={tableLabel}
    >
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
            visibleRows.map((row, rowIndex) => {
              const rowKey = getRowKey(row);
              const isClickableRow = Boolean(onRowClick);

              return (
                <tr
                  key={rowKey}
                  ref={rowIndex === 0 ? firstRowRef : undefined}
                  className={selectedRowId === rowKey ? "selected-row" : ""}
                  onClick={() => onRowClick?.(row)}
                  onKeyDown={(event) => handleRowKeyDown(event, row)}
                  tabIndex={isClickableRow ? 0 : undefined}
                  aria-label={getRowAriaLabel?.(row)}
                  aria-selected={isClickableRow ? selectedRowId === rowKey : undefined}
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
            onClick={() => handlePageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            aria-label="Forrige side"
          >
            {FaChevronLeft({ className: "icon" })}
          </button>

          <span>{page} / {totalPages}</span>

          <button
            type="button"
            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
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

