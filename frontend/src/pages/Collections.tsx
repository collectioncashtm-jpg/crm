import { useQuery } from '@tanstack/react-query'
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/api'

interface Collection {
  _id: string
  name: string
  phoneNo: string
  accNo: string
  overdue: number
  status: string
}

export default function Collections() {
  const { data: collections, isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const res = await api.get('/collections')
      return res.data.data
    },
  })

  const { data: stats } = useQuery({
    queryKey: ['collection-stats'],
    queryFn: async () => {
      const res = await api.get('/collections/stats')
      return res.data.data
    },
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700'
      case 'overdue': return 'bg-red-100 text-red-700'
      case 'closed': return 'bg-slate-100 text-slate-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Collections</h1>
          <p className="text-sm text-slate-500">Track overdue & recovery</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">Total Overdue</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(stats?.totalOverdue || 0)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">Accounts</p>
          <p className="text-2xl font-bold text-slate-900">{stats?.totalAccounts || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">0-30k Bucket</p>
          <p className="text-2xl font-bold text-brand-600">{formatCurrency(stats?.buckets?.['0-30k']?.amount || 0)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">90k+ Bucket</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(stats?.buckets?.['90k+']?.amount || 0)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Customer</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Phone</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Account No.</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Overdue Amount</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400">Loading...</td></tr>
              ) : !collections || collections.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400">No overdue records found</td></tr>
              ) : (
                collections.map((c: Collection) => (
                  <tr key={c._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{c.name}</td>
                    <td className="py-3 px-4">{c.phoneNo}</td>
                    <td className="py-3 px-4 font-mono text-brand-600">{c.accNo}</td>
                    <td className="py-3 px-4 font-medium text-red-600">{formatCurrency(c.overdue)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-xs bg-brand-600 text-white rounded-lg hover:bg-brand-700">Payment</button>
                        <button className="px-3 py-1 text-xs bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">Remind</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
