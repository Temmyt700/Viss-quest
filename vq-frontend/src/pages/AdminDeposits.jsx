import AdminTable from '../components/AdminTable'

function AdminDeposits({ deposits }) {
  return (
    <section className="stack-lg">
      <h1>Wallet Deposits</h1>
      <AdminTable
        columns={[
          { key: 'referenceId', label: 'Reference ID' },
          { key: 'amount', label: 'Amount' },
          { key: 'status', label: 'Status' },
        ]}
        rows={deposits}
      />
    </section>
  )
}

export default AdminDeposits

