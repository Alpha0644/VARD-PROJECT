'use client'

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

// Generate Styles
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
        fontSize: 12,
        color: '#333'
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111'
    },
    subtitle: {
        fontSize: 10,
        color: '#666',
        marginTop: 4
    },
    logo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2563eb' // Blue-600
    },
    section: {
        marginBottom: 20
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#444',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 4
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6
    },
    label: {
        color: '#666'
    },
    value: {
        fontWeight: 'bold'
    },
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#eee',
        marginTop: 10
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f9fafb',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        padding: 8
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        padding: 8
    },
    col1: { width: '40%' },
    col2: { width: '20%' },
    col3: { width: '20%' },
    col4: { width: '20%', textAlign: 'right' },

    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 10,
        color: '#999',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10
    }
})

interface MissionItem {
    id: string
    title: string
    date: Date | string
    hours?: number
    revenue?: number
    cost?: number
    status?: string
}

interface ReportPDFProps {
    type: 'AGENT' | 'COMPANY'
    userName: string
    period: string
    data: {
        summary: Record<string, number>
        missions: MissionItem[]
    }
}

export function ReportPDF({ type, userName, period, data }: ReportPDFProps) {
    const isAgent = type === 'AGENT'
    const generatedDate = format(new Date(), 'PPP à HH:mm', { locale: fr })

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>{isAgent ? 'Relevé d\'Activité' : 'Rapport Mensuel'}</Text>
                        <Text style={styles.subtitle}>{period.charAt(0).toUpperCase() + period.slice(1)}</Text>
                    </View>
                    <View>
                        <Text style={styles.logo}>VARD</Text>
                        <Text style={styles.subtitle}>Sécurité Privée</Text>
                    </View>
                </View>

                {/* User Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informations</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>{isAgent ? 'Agent :' : 'Entreprise :'}</Text>
                        <Text style={styles.value}>{userName}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Période :</Text>
                        <Text style={styles.value}>{period}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Généré le :</Text>
                        <Text style={styles.value}>{generatedDate}</Text>
                    </View>
                </View>

                {/* Summary Stats */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Synthèse</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f3f4f6', padding: 15, borderRadius: 4 }}>
                        <View>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2563eb' }}>
                                {data.summary.totalMissions}
                            </Text>
                            <Text style={{ fontSize: 10, color: '#666' }}>Missions terminées</Text>
                        </View>

                        {isAgent ? (
                            <>
                                <View>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#10b981' }}>
                                        {data.summary.totalHours}h
                                    </Text>
                                    <Text style={{ fontSize: 10, color: '#666' }}>Heures travaillées</Text>
                                </View>
                                <View>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111' }}>
                                        {data.summary.totalRevenue}€
                                    </Text>
                                    <Text style={{ fontSize: 10, color: '#666' }}>Revenus estimés</Text>
                                </View>
                            </>
                        ) : (
                            <>
                                <View>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#f59e0b' }}>
                                        {data.summary.fillRate}%
                                    </Text>
                                    <Text style={{ fontSize: 10, color: '#666' }}>Taux de remplissage</Text>
                                </View>
                                <View>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111' }}>
                                        {data.summary.totalSpend}€
                                    </Text>
                                    <Text style={{ fontSize: 10, color: '#666' }}>Dépenses totales</Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* Mission Details Table */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Détail des Missions</Text>
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.col1}>Mission</Text>
                            <Text style={styles.col2}>Date</Text>
                            <Text style={styles.col3}>{isAgent ? 'Heures' : 'Statut'}</Text>
                            <Text style={styles.col4}>{isAgent ? 'Revenu' : 'Coût'}</Text>
                        </View>

                        {data.missions.map((mission, i) => (
                            <View key={i} style={styles.tableRow}>
                                <Text style={styles.col1}>{mission.title}</Text>
                                <Text style={styles.col2}>
                                    {format(new Date(mission.date), 'dd/MM/yyyy')}
                                </Text>
                                <Text style={styles.col3}>
                                    {isAgent ? `${mission.hours}h` : mission.status}
                                </Text>
                                <Text style={styles.col4}>
                                    {isAgent ? `${mission.revenue}€` : `${mission.cost}€`}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>VARD - Plateforme de Sécurité Privée - www.vard.test</Text>
                    <Text>Ce document est généré automatiquement et ne vaut pas facture officielle.</Text>
                </View>
            </Page>
        </Document>
    )
}
