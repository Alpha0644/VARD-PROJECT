'use client'

import { useState, useEffect } from 'react'
import { startOfMonth, format } from 'date-fns'
import { MonthSelector } from '@/components/reports/month-selector'
import { StatsChart } from '@/components/reports/stats-chart'
import { ReportPDF } from '@/components/reports/pdf-document'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { FileDown, Loader2, TrendingUp, Clock, Euro } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeletons'

export function AgentReportingClient({ userName }: { userName: string }) {
    const [currentDate, setCurrentDate] = useState(startOfMonth(new Date()))
    const [isLoading, setIsLoading] = useState(true)
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true)
            try {
                const dateStr = format(currentDate, 'yyyy-MM')
                const res = await fetch(`/api/reports/agent/stats?date=${dateStr}`)
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
        <div className="space-y-6 pt-4">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                <MonthSelector currentDate={currentDate} onChange={setCurrentDate} />

                {data && (
                    <PDFDownloadLink
                        document={
                            <ReportPDF
                                type="AGENT"
                                userName={userName}
                                period={data.period}
                                data={data}
                            />
                        }
                        fileName={`releve-activite-${format(currentDate, 'yyyy-MM')}.pdf`}
                    >
                        {({ loading }) => (
                            <button
                                disabled={loading}
                                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
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
                        <span className="text-sm font-medium">Missions Terminées</span>
                    </div>
                    {isLoading ? <Skeleton className="h-8 w-16" /> : (
                        <p className="text-3xl font-bold text-gray-900">{data?.summary.totalMissions ?? 0}</p>
                    )}
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <Clock className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-medium">Heures Travaillées</span>
                    </div>
                    {isLoading ? <Skeleton className="h-8 w-16" /> : (
                        <p className="text-3xl font-bold text-gray-900">{data?.summary.totalHours ?? 0}h</p>
                    )}
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <Euro className="w-5 h-5 text-amber-500" />
                        <span className="text-sm font-medium">Revenus Estimés</span>
                    </div>
                    {isLoading ? <Skeleton className="h-8 w-16" /> : (
                        <p className="text-3xl font-bold text-gray-900">{data?.summary.totalRevenue ?? 0}€</p>
                    )}
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Revenus (6 derniers mois)</h3>
                    {isLoading ? <Skeleton className="h-[300px] w-full" /> : (
                        data?.chartData && <StatsChart data={data.chartData} type="area" color="#3b82f6" unit="€" />
                    )}
                </div>

                {/* Recent Missions Table */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Détails du mois</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="bg-gray-50 text-gray-700 uppercase">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Mission</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3 text-right">Revenu</th>
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
                                                <div className="text-xs text-gray-400 font-normal">
                                                    {mission.company.companyName}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {format(new Date(mission.startTime), 'dd MMM')}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-gray-900">
                                                {mission.revenue}€
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
