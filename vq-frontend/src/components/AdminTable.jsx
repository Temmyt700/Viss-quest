import { useEffect, useMemo, useState } from 'react'
import './AdminTable.css'

function AdminTable({ columns, rows, pageSize = 10, emptyMessage = 'No records available yet.' }) {
  const [visibleCount, setVisibleCount] = useState(pageSize)

  useEffect(() => {
    setVisibleCount(pageSize)
  }, [pageSize, rows])

  const visibleRows = useMemo(() => rows.slice(0, visibleCount), [rows, visibleCount])
  const hasMore = rows.length > visibleCount

  return (
    <div className="table-wrap card stack">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleRows.length ? visibleRows.map((row, index) => (
            <tr key={row.id || row.referenceId || index}>
              {columns.map((column) => (
                <td key={column.key}>{row[column.key]}</td>
              ))}
            </tr>
          )) : (
            <tr>
              <td colSpan={columns.length} className="admin-table-empty">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {(rows.length > pageSize || hasMore) ? (
        <div className="table-pagination">
          <span className="muted">
            Showing {Math.min(visibleCount, rows.length)} of {rows.length}
          </span>
          {hasMore ? (
            <button type="button" className="btn btn-soft" onClick={() => setVisibleCount((prev) => prev + pageSize)}>
              Load More
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default AdminTable
