import AdminTable from '../components/AdminTable'

function AdminParticipants({ participants }) {
  return (
    <section className="stack-lg">
      <h1>Participants</h1>
      <AdminTable
        columns={[
          { key: 'referenceId', label: 'Reference ID' },
          { key: 'draw', label: 'Draw' },
          { key: 'status', label: 'Status' },
        ]}
        rows={participants}
      />
    </section>
  )
}

export default AdminParticipants

