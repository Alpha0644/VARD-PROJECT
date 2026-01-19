# Phase 3.2 - GPS Live Tracking

## Objectif
Permettre à l'Entreprise de suivre la position de l'Agent **en temps réel** pendant une mission active (comme Uber).

---

## Architecture

```
Agent (Mobile/Desktop)
    ↓ Browser Geolocation API (watchPosition)
    ↓ POST /api/agent/location (every 10s)
    ↓ Redis GEO + Pusher trigger
              ↓
Company Dashboard ← Pusher subscription (presence-mission-{id})
    ↓ Map updates live
```

---

## Changes Implemented

### Backend

#### [NEW] `app/api/agent/location/live/route.ts`
- `POST`: Reçoit position GPS de l'Agent
- Stocke dans Redis (`GEOADD`)
- Trigger Pusher event `agent:location` sur canal `presence-mission-{missionId}`
- Rate limited (1 req/5s par agent)

#### [MODIFY] `lib/redis-geo.ts`
- Ajouter `updateAgentLiveLocation(agentId, missionId, lat, lng)`

#### [MODIFY] `lib/pusher.ts`
- Trigger `agent:location` avec `{ lat, lng, timestamp }`

---

### Frontend

#### [NEW] `hooks/use-geolocation-tracker.ts`
- Utilise `navigator.geolocation.watchPosition()`
- Envoie position à `/api/agent/location/live` toutes les 10s
- Gère les erreurs (permission refusée, GPS indisponible)

#### [NEW] `components/agent/live-tracking-toggle.tsx`
- Bouton ON/OFF pour activer le tracking
- Affiche statut (Tracking actif / Inactif)

#### [MODIFY] `components/agent/active-mission.tsx`
- Intégrer `LiveTrackingToggle` quand mission = EN_ROUTE ou IN_PROGRESS

#### [NEW] `components/company/agent-map.tsx`
- Carte (Leaflet ou Google Maps)
- Écoute Pusher `agent:location`
- Met à jour la position du marqueur en temps réel

#### [MODIFY] `app/company/missions/[id]/page.tsx`
- Afficher `AgentMap` pour les missions actives

---

## Security Verified

- ✅ Agent ne peut tracker que SES missions actives
- ✅ Company ne peut voir que SES missions
- ✅ Rate limiting (anti-spam GPS)
- ✅ Position stockée temporairement (TTL Redis)
