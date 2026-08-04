import { useMemo, useState } from 'react'
import { Gauge, Trophy, AlertOctagon, IndianRupee } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts'

import KpiCard from '../../components/kpi/KpiCard'
import StatusBadge from '../../components/badge/StatusBadge'
import ChartWrapper from '../../components/charts/ChartWrapper'
import TableFilterBar from '../../components/table/TableFilterBar'
import DataTable from '../../components/table/DataTable'
import ChartTooltip from '../../components/charts/ChartTooltip'
import { KpiCardSkeleton, ChartSkeleton, TableSkeleton } from '../../components/ui/Skeleton'
import { useDelayedLoading } from '../../lib/useDelayedLoading'
import { filterRows } from '../../lib/sorting'
import { formatCurrency, formatPercent } from '../../lib/formatters'
import { targets, targetsKpis, branchAchievement } from '../../data/targets.data'

const STATUS_TONE = { 'On Track': 'positive', Behind: 'negative', Exceeded: 'positive' }

const gaugeData = [{ name: 'Company', value: targetsKpis.companyPct, fill: '#4f46e5' }]

export default function TargetsPage() {
  const isLoading = useDelayedLoading(500)
  const [search, setSearch] = useState('')
  const [branchFilter, setBranchFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  const filtered = useMemo(
    () =>
      filterRows(targets, {
        search,
        searchKeys: ['staff'],
        fieldFilters: { branch: branchFilter, status: statusFilter },
      }),
    [search, branchFilter, statusFilter]
  )

  const columns = [
    { key: 'staff', label: 'Staff', sortable: true },
    { key: 'branch', label: 'Branch', sortable: true },
    { key: 'target', label: 'Target', sortable: true, align: 'right', render: (r) => formatCurrency(r.target) },
    { key: 'achieved', label: 'Achieved', sortable: true, align: 'right', render: (r) => formatCurrency(r.achieved) },
    { key: 'remaining', label: 'Remaining', sortable: true, align: 'right', render: (r) => formatCurrency(r.remaining) },
    { key: 'pct', label: '% Achieved', sortable: true, align: 'right', render: (r) => formatPercent(r.pct) },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (r) => <StatusBadge status={STATUS_TONE[r.status]}>{r.status}</StatusBadge>,
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2"><ChartSkeleton /></div>
          <ChartSkeleton height={280} />
        </div>
        <TableSkeleton rows={7} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Company Target Completion" value={formatPercent(targetsKpis.companyPct)} icon={Gauge} subtext="Jul 2026" />
        <KpiCard
          label="Top Performer"
          value={targetsKpis.topPerformer.staff}
          icon={Trophy}
          subtext={`${formatPercent(targetsKpis.topPerformer.pct)} achieved`}
        />
        <KpiCard
          label="Staff Behind Target"
          value={targetsKpis.behindCount}
          icon={AlertOctagon}
          trend={{ direction: 'down', value: `${targetsKpis.behindCount} of ${targets.length}`, tone: 'negative' }}
        />
        <KpiCard
          label="Total Achieved"
          value={formatCurrency(targetsKpis.totalAchieved)}
          icon={IndianRupee}
          subtext={`of ${formatCurrency(targetsKpis.totalTarget)} target`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartWrapper title="Achieved vs Target by Branch" subtitle="Jul 2026">
            <BarChart data={branchAchievement} layout="vertical" margin={{ left: 20 }} >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e8ee" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#6b84a8" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="#6b84a8" width={90} />
              <ChartTooltip formatter={(v) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="target" name="Target" fill="#cbd5e1" radius={[0, 6, 6, 0]} />
              <Bar dataKey="achieved" name="Achieved" fill="#4f46e5" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ChartWrapper>
        </div>

        <ChartWrapper title="Company-wide Completion" subtitle="This period">
          <RadialBarChart
            innerRadius="65%"
            outerRadius="100%"
            data={gaugeData}
            startAngle={90}
            endAngle={-270}
            
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" cornerRadius={12} background={{ fill: '#e5e8ee' }} />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-fg text-2xl font-semibold"
            >
              {targetsKpis.companyPct}%
            </text>
          </RadialBarChart>
        </ChartWrapper>
      </div>

      {/* Leaderboard table */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-fg">Leaderboard — Ranked by % Achieved</h3>
        <TableFilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search staff..."
          filters={[
            { key: 'branch', label: 'Branch', options: ['Kochi', 'Bengaluru', 'Chennai', 'Coimbatore', 'Mysuru'] },
            { key: 'status', label: 'Status', options: ['On Track', 'Behind', 'Exceeded'] },
          ]}
          values={{ branch: branchFilter, status: statusFilter }}
          onFilterChange={(key, value) => {
            if (key === 'branch') setBranchFilter(value)
            if (key === 'status') setStatusFilter(value)
          }}
        />
        <DataTable columns={columns} rows={filtered} pageSize={10} />
      </div>
    </div>
  )
}