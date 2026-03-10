import AdminTable from '../components/AdminTable'

function AdminWinners({ winners }) {
  return (
    <section className="stack-lg">
      <h1>Winners Management</h1>
      <AdminTable
        columns={[
          { key: 'referenceId', label: 'Reference ID' },
          { key: 'prize', label: 'Prize' },
          { key: 'date', label: 'Date Won' },
        ]}
        rows={winners}
      />
    </section>
  )
}

export default AdminWinners

