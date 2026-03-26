import { Users, FileText, CalendarPlus } from 'lucide-react'
import { useLeads } from '@/contexts/LeadsContext'

export function Metrics() {
  const { leads } = useLeads()

  const totalLeads = leads.length
  const activeProposals = leads.filter((l) => l.status === 'Proposal').length

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const newThisWeek = leads.filter((l) => l.createdAt >= oneWeekAgo).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="bg-blue-50 p-4 rounded-xl">
          <Users className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Total Leads</p>
          <p className="text-3xl font-bold text-gray-900">{totalLeads}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="bg-purple-50 p-4 rounded-xl">
          <FileText className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Active Proposals</p>
          <p className="text-3xl font-bold text-gray-900">{activeProposals}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="bg-green-50 p-4 rounded-xl">
          <CalendarPlus className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">
            New Leads this Week
          </p>
          <p className="text-3xl font-bold text-gray-900">{newThisWeek}</p>
        </div>
      </div>
    </div>
  )
}
