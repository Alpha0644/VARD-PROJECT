'use client'

import { useState, useEffect } from 'react'
import { StatsChart } from '@/components/reports/stats-chart'
import { Skeleton } from '@/components/ui/skeletons'
import { Users, Building2, Briefcase, TrendingUp } from 'lucide-react'

export function AdminAnalyticsClient() {
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetch('/api/reports/admin/stats')
            .then(res => res.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setIsLoading(false))
    }, [])

    return (
        <div className="space-y-6">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard
                    label="Agents"
                    value={data?.kpis.totalAgents}
                    icon={Users}
                    color="text-blue-600 bg-blue-100"
                    loading={isLoading}
                />
                <KpiCard
                    label="Entreprises"
                    value={data?.kpis.totalCompanies}
                    icon={Building2}
                    color="text-purple-600 bg-purple-100"
                    loading={isLoading}
                />
                <KpiCard
                    label="Missions Actives"
                    value={data?.kpis.activeMissionsCount}
                    icon={Briefcase}
                    color="text-green-600 bg-green-100"
                    loading={isLoading}
                />
                <KpiCard
                    label="Volume Affaires (6 mois)"
                    value={data ? `${data.kpis.totalVolume}€` : null}
                    icon={TrendingUp}
                    color="text-amber-600 bg-amber-100"
                    loading={isLoading}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Volume d'Affaires Mensuel</h3>
                    <div className="h-[300px]">
                        {isLoading ? <Skeleton className="w-full h-full" /> : (
                            <StatsChart data={data?.charts.monthlyActivity} type="area" color="#f59e0b" unit="€" />
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Missions Complétées</h3>
                    <div className="h-[300px]">
                        {isLoading ? <Skeleton className="w-full h-full" /> : (
                            <StatsChart
                                data={data?.charts.monthlyActivity.map((d: any) => ({ name: d.name, value: d.count }))}
                                type="bar"
                                color="#3b82f6"
                                unit=""
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function KpiCard({ label, value, icon: Icon, color, loading }: any) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {loading ? <Skeleton className="h-8 w-12" /> : (
                    <span className="text-3xl font-bold text-gray-900">{value}</span>
                )}
            </div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
        </div>
    )
}
