import { Metrics } from '@/components/dashboard/Metrics'
import { useLeads } from '@/contexts/LeadsContext'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

export default function Index() {
  const { leads } = useLeads()
  const recentLeads = [...leads]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your Neutrowaste B2B opportunities.
        </p>
      </div>

      <Metrics />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Recent Leads</h2>
          <Link to="/leads">
            <Button
              variant="ghost"
              className="text-green-700 hover:text-green-800 hover:bg-green-50"
            >
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {recentLeads.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No leads found.</p>
          ) : (
            recentLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {lead.company}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {lead.contact} • {lead.industry}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400 hidden sm:block">
                    {format(lead.createdAt, 'MMM d, yyyy')}
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      lead.status === 'Prospect'
                        ? 'bg-gray-100 text-gray-700 border-gray-200'
                        : lead.status === 'Qualified'
                          ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                          : lead.status === 'Proposal'
                            ? 'bg-purple-100 text-purple-700 border-purple-200'
                            : 'bg-green-100 text-green-700 border-green-200'
                    }
                  >
                    {lead.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
