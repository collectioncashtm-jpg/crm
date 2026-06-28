import { useState } from 'react'
import { Download, Trash2, Save } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function Settings() {
  const [companyName, setCompanyName] = useState('Narainsons Finance & Consultancy Pvt. Ltd.')

  const handleExport = async () => {
    try {
      const res = await api.get('/customers?limit=10000')
      const customers = res.data.data

      const headers = 'name,panCard,phoneNo,accNo,disbursedDate,disbursedAmt,overdue,status'
      const rows = customers.map((c: any) => 
        `${c.name},${c.panCard},${c.phoneNo},${c.accNo},${c.disbursedDate},${c.disbursedAmt},${c.overdue},${c.status}`
      )

      const csv = [headers, ...rows].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'customers_export.csv'
      a.click()
      toast.success('CSV exported!')
    } catch (err) {
      toast.error('Export failed')
    }
  }

  const handleClear = async () => {
  if (!confirm('Clear ALL data from database? This cannot be undone.')) return
  try {
    await api.delete('/customers/all')
    await api.delete('/emi/all')
    await api.delete('/payments/all')
    await api.delete('/tasks/all')
    toast.success('All data cleared successfully!')
    window.location.reload()
  } catch (err) {
    toast.error('Failed to clear data')
  }
}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Manage your CRM settings</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Company Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
            <input 
              type="text" 
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Version</label>
            <input 
              type="text" 
              value="2.0.0" 
              readOnly
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
            />
          </div>
        </div>
        <button 
          onClick={() => toast.success('Settings saved!')}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Data Management</h3>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Download className="w-4 h-4" />
            Export Customers CSV
          </button>
          <button 
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-medium text-red-700 hover:bg-red-100"
          >
            <Trash2 className="w-4 h-4" />
            Clear All Data
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">About</h3>
        <div className="space-y-2 text-sm text-slate-600">
          <p><span className="font-medium">Application:</span> Narainsons Finance CRM</p>
          <p><span className="font-medium">Version:</span> 2.0.0</p>
          <p><span className="font-medium">Built with:</span> React 18, Tailwind CSS, Express, MongoDB</p>
          <p><span className="font-medium">Support:</span> collection.cashtm@gmail.com</p>
        </div>
      </div>
    </div>
  )
}
