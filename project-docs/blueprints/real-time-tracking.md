# Blueprint: Real-Time Mission Tracking (Uber-like)

## 🎯 Objective
Enable Companies to track Agents in real-time from the moment they accept a mission until completion.

## 📡 Data Flow

### 1. Trigger (The Agent)
- **Component**: `ActiveMission` (Agent Dashboard)
- **Action**: 
  - `navigator.geolocation.watchPosition` starts **AUTOMATICALLY** when status is `EN_ROUTE`, `ARRIVED` or `IN_PROGRESS`.
  - No manual toggle required (Agent consent handled at login/mission accept).
  - **Throttling**: Send updates max every 5 seconds (to save battery & quota).
  - **Payload**:
    ```json
    {
      "missionId": "uuid",
      "lat": 48.8566,
      "lng": 2.3522,
      "status": "EN_ROUTE",
      "timestamp": 1700000000
    }
    ```
- **Transport**: Pusher Client (`client-location-update` event on private channel).

### 2. The Wire (Pusher)
- **Channel**: `private-mission-[missionId]`
- **Event**: `client-location-update` (Client events bypass backend for speed, requires enabled in Pusher dashboard?) 
  - *Correction*: OMEGA Protocol prefers server validation. 
  - **Better Path**: Agent -> API (`POST /api/missions/[id]/track`) -> Pusher Trigger (`server-location-update`).
  - **Why?** Security. We don't want anyone identifying as any agent on a channel. Also allows recording history if needed.

### 3. Receiver (The Company)
- **Component**: `MissionDetailsPage` -> `MissionMap`
- **Action**: 
  - Subscribes to `private-mission-[missionId]`.
  - Listen for `server-location-update`.
  - Update Leaflet Marker position with animation.

### 4. Real-Time Dashboard Feed (Pusher)
- **Problem**: Agent dashboard needs refresh to see new missions.
- **Solution**:
  - Backend triggers `mission-created` on channel `available-missions`.
  - `MissionProposals` component listens and prepends new mission to list.

## 🛠️ Implementation Steps (Phase 8 & 9)

1. **API Endpoint**: `POST /api/missions/[id]/track`
   - Validate Agent owns the mission.
   - Updates `mission.agentLastLat/Lng` in DB (optional, for persistence).
   - Triggers Pusher event.

2. **Agent Component**: `ActiveMission`
   - Remove Manual Toggle UI.
   - Auto-mount `useGeolocation` when status implies movement.

3. **Company Component**: `MissionMap`
   - Add Pusher subscription.
   - Handle live updates.

4. **Agent Dashboard**: `MissionProposals`
   - Subscribe to `public-missions` channel.
   - Listen for `mission:created` event.

## ⚠️ Security & Constraints
- **Privacy**: Stop tracking immediately when status becomes `COMPLETED`.
- **Accuracy**: Filter GPS noise if accuracy > 50m.
- **Battery**: Don't keep GPS on if app is backgrounded (limitations of web).
