import { useState } from 'react'
import { useLeads, LeadStatus } from '@/contexts/LeadsContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Edit2, Eye, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function Leads() {
  const { leads } = useLeads()
  const [search, setSearch] = useState('')

  const filteredLeads = leads.filter(
    (l) =>
      l.company.toLowerCase().includes(search.toLowerCase()) ||
      l.contact.toLowerCase().includes(search.toLowerCase()),
  )

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'Prospect':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'Qualified':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Proposal':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'Closed':
        return 'bg-green-100 text-green-700 border-green-200'
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads List</h1>
          <p className="text-muted-foreground">
            Manage your B2B prospects and clients.
          </p>
        </div>
        <Link to="/leads/new">
          <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6">
            <Plus className="w-4 h-4 mr-2" /> Register New Lead
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by company or contact..."
              className="pl-9 bg-gray-50 border-gray-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500"
                >
                  No leads found.
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium text-gray-900">
                    {lead.company}
                  </TableCell>
                  <TableCell>{lead.contact}</TableCell>
                  <TableCell className="text-gray-500 hidden md:table-cell">
                    {lead.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusColor(lead.status)}
                    >
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-blue-600"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-green-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
