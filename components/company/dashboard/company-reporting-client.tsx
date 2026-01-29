'use client'

import { useState, useEffect } from 'react'
import { startOfMonth, format } from 'date-fns'
import { MonthSelector } from '@/components/reports/month-selector'
import { StatsChart } from '@/components/reports/stats-chart'
import { ReportPDF } from '@/components/reports/pdf-document'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { FileDown, Loader2, Target, CreditCard, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeletons'

export function CompanyReportingClient({ userName }: { userName: string }) {
    const [currentDate, setCurrentDate] = useState(startOfMonth(new Date()))
    const [isLoading, setIsLoading] = useState(true)
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true)
            try {
                const dateStr = format(currentDate, 'yyyy-MM')
                const res = await fetch(`/api/reports/company/stats?date=${dateStr}`)
                if (!res.ok) throw new Error('Erreur chargement')
                const json = await res.json()
                setData(json)
            } catch (error) {
                toast.error('Impossible de charger les statistiques')
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchStats()
    }, [currentDate])

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <MonthSelector currentDate={currentDate} onChange={setCurrentDate} />

                {data && (
                    <PDFDownloadLink
                        document={
                            <ReportPDF
                                type="COMPANY"
                                userName={userName}
                                period={data.period}
                                data={data}
                            />
                        }
                        fileName={`rapport-mensuel-${format(currentDate, 'yyyy-MM')}.pdf`}
                    >
                        {({ loading }) => (
                            <button
                                disabled={loading}
                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                                Télécharger PDF
                            </button>
                        )}
                    </PDFDownloadLink>
                )}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-medium">Missions du mois</span>
                    </div>
                    {isLoading ? <Skeleton className="h-8 w-16" /> : (
                        <div className="flex items-end gap-2">
                            <p className="text-3xl font-bold text-gray-900">{data?.summary.totalMissions ?? 0}</p>
                            <span className="text-sm text-gray-500 mb-1">créées</span>
                        </div>
                    )}
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <Target className="w-5 h-5 text-purple-500" />
                        <span className="text-sm font-medium">Taux de Remplissage</span>
                    </div>
                    {isLoading ? <Skeleton className="h-8 w-16" /> : (
                        <div className="flex items-end gap-2">
                            <p className="text-3xl font-bold text-gray-900">{data?.summary.fillRate ?? 0}%</p>
                            <span className="text-sm text-gray-500 mb-1">complétées</span>
                        </div>
                    )}
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <CreditCard className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-medium">Dépenses Totales</span>
                    </div>
                    {isLoading ? <Skeleton className="h-8 w-16" /> : (
                        <p className="text-3xl font-bold text-gray-900">{data?.summary.totalSpend ?? 0}€</p>
                    )}
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Dépenses (6 derniers mois)</h3>
                    {isLoading ? <Skeleton className="h-[300px] w-full" /> : (
                        data?.chartData && <StatsChart data={data.chartData} type="bar" color="#10b981" unit="€" />
                    )}
                </div>

                {/* Recent Missions Table */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Détail des coûts</h3>
                    <div className="overflow-x-auto max-h-[300px]">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="bg-gray-50 text-gray-700 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Mission</th>
                                    <th className="px-4 py-3">Agent</th>
                                    <th className="px-4 py-3 text-right">Coût</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    [1, 2, 3].map(i => (
                                        <tr key={i}>
                                            <td colSpan={3} className="p-4"><Skeleton className="h-4 w-full" /></td>
                                        </tr>
                                    ))
                                ) : data?.missions.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                                            Aucune mission sur cette période
                                        </td>
                                    </tr>
                                ) : (
                                    data?.missions.map((mission: any) => (
                                        <tr key={mission.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                {mission.title}
                                                <div className="text-xs">
                                                    <span className={`px-1.5 py-0.5 rounded ${mission.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                            mission.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {mission.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {mission.agentName}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-gray-900">
                                                {mission.cost > 0 ? `${mission.cost}€` : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
