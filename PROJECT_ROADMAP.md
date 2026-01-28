# 🗺️ VARD PROJECT - ROADMAP & ÉTAT DU PROJET
**"Uber pour la Sécurité Privée"**

> **Dernière mise à jour :** 2026-01-27  
> **Statut :** MVP Development - Phase 2 en cours

---

## 📊 ÉTAT ACTUEL DU PROJET

### ✅ Fonctionnalités TERMINÉES

| Module | Feature | Statut |
|--------|---------|--------|
| **Auth & Identity** | Inscription différenciée (Agent/Company) | ✅ |
| **Auth & Identity** | Login/Logout avec NextAuth v5 | ✅ |
| **Auth & Identity** | Mot de passe oublié | ✅ |
| **Auth & Identity** | Protection des routes par rôle | ✅ |
| **Onboarding** | Upload documents (CNAPS, SIREN) | ✅ |
| **Onboarding** | Validation manuelle Admin | ✅ |
| **Mission Dispatch** | Création mission par Company | ✅ |
| **Mission Dispatch** | Matching géolocalisé (rayon X km) | ✅ |
| **Mission Dispatch** | Notifications Push Web | ✅ |
| **Mission Dispatch** | Real-time feed (Pusher) | ✅ |
| **Gestion Mission** | Acceptation instantanée | ✅ |
| **Gestion Mission** | Statuts (PENDING→COMPLETED) | ✅ |
| **Gestion Mission** | Tracking GPS live agent | ✅ |
| **Gestion Mission** | Check-in/Check-out | ✅ |
| **Gestion Mission** | Double-Booking Prevention | ✅ **(2026-01-27)** |
| **Gestion Mission** | Documents Expirés → Blocage | ✅ **(2026-01-27)** |
| **Dashboard Agent** | Vue missions disponibles | ✅ |
| **Dashboard Agent** | Espace opérationnel | ✅ |
| **Dashboard Agent** | Historique missions | ✅ |
| **Dashboard Company** | Liste missions publiées | ✅ |
| **Dashboard Company** | Suivi statut missions | ✅ |
| **Dashboard Company** | Tracking agent temps réel | ✅ |
| **Dashboard Admin** | Validation documents | ✅ |
| **Dashboard Admin** | Vue utilisateurs | ✅ |
| **Rating System** | Système de notation | ✅ |

---

## 🔄 PROCHAINES ÉTAPES (par ordre de priorité)

### Phase 2 : Finalisation MVP (En cours)

| Priorité | Tâche | Statut |
|----------|-------|--------|
| 🔴 | Double-booking prevention | ✅ FAIT |
| 🔴 | Documents expirés → suspension auto | ✅ FAIT |
| 🟠 | Annulation mission + relance matching | ✅ FAIT |
| 🟠 | Responsive mobile (toutes pages) | ⬜ TODO |
| 🟡 | Profil Agent complet (photo, bio) | ⬜ TODO |
| 🟡 | Profil Company complet (logo) | ⬜ TODO |
| 🔴 | Tests E2E Playwright | ⬜ TODO |

### Phase 3 : Reporting & Analytics

| Priorité | Tâche | Statut |
|----------|-------|--------|
| 🟠 | Récapitulatif mensuel heures (Agent) | ⬜ TODO |
| 🟠 | Récapitulatif mensuel missions (Company) | ⬜ TODO |
| 🟠 | Dashboard statistiques | ⬜ TODO |
| 🔴 | Export données RGPD | ⬜ TODO |
| 🟠 | KPIs Admin (fill rate, no-shows) | ⬜ TODO |

### Phase 4 : Sécurité & Compliance

| Priorité | Tâche | Statut |
|----------|-------|--------|
| 🔴 | Rate limiting tous endpoints | ⬜ TODO |
| 🔴 | Headers sécurité (CSP, HSTS) | ⬜ TODO |
| 🔴 | Page Mentions Légales | ⬜ TODO |
| 🔴 | Banner cookies RGPD | ⬜ TODO |
| 🟠 | Droit à l'effacement | ⬜ TODO |

### Phase 5 : Infrastructure Production

| Priorité | Tâche | Statut |
|----------|-------|--------|
| 🔴 | Pipeline CI/CD complet | ⬜ TODO |
| 🔴 | Sentry configuration | ⬜ TODO |
| 🔴 | Uptime monitoring | ⬜ TODO |
| 🔴 | Backups automatiques DB | ⬜ TODO |

### Phase 6 : Lancement Beta

| Priorité | Tâche | Statut |
|----------|-------|--------|
| 🔴 | Landing page convaincante | ⬜ TODO |
| 🟠 | Templates email | ⬜ TODO |
| 🟠 | Documentation FAQ | ⬜ TODO |
| 🔴 | Beta testing (10-20 users) | ⬜ TODO |

### Phase 7 : Post-MVP (v2.0) - FUTUR

| Priorité | Tâche | Statut |
|----------|-------|--------|
| 🟠 | Stripe Connect (paiement in-app) | ⬜ FUTUR |
| 🟡 | Chat in-app | ⬜ FUTUR |
| 🟢 | App mobile native | ⬜ FUTUR |
| 🟢 | Assurance intégrée | ⬜ FUTUR |

---

## 📅 Timeline Estimée

```
Phase 2 (MVP)     : Semaine 1-2  ████████░░░░░░░░░░░░  [EN COURS]
Phase 3 (Reports) : Semaine 2-3  ░░░░░░░░████████░░░░  
Phase 4 (Security): Semaine 3-4  ░░░░░░░░░░░░████████  
Phase 5 (Infra)   : Semaine 4-5  ░░░░░░░░░░░░░░░░████  
Phase 6 (Beta)    : Semaine 5-6  ░░░░░░░░░░░░░░░░░░██  

🚀 LANCEMENT MVP : Semaine 6-7
```

---

## 🔧 Changements Récents (Changelog)

### 2026-01-28
- ✅ Implémenté **Annulation Mission + Relance Matching** 
  - API `/api/missions/[id]/cancel` avec validation et logs
  - Compteur `cancellationCount` dans le modèle Agent (pénalité simple)
  - Modal `CancelMissionModal` pour confirmation
  - Relance automatique du matching si l'agent annule
  - Notifications Push et Email aux autres agents disponibles

### 2026-01-27
- ✅ Implémenté **Double-Booking Prevention** dans `/api/missions/[id]/status/route.ts`
  - Vérifie si l'agent a déjà une mission sur le même créneau horaire
  - Retourne un message d'erreur clair avec les détails de la mission conflictuelle
  - Couvre les statuts : ACCEPTED, EN_ROUTE, ARRIVED, IN_PROGRESS
- ✅ Implémenté **Documents Expirés → Blocage** dans `lib/documents.ts`
  - Nouvelle fonction `checkAgentCanOperate()` - vérifie si l'agent peut opérer
  - Nouvelle fonction `checkAgentDocumentsValidity()` - détails de l'expiration
  - Bloque l'acceptation de mission si carte pro expirée
  - Avertissement si expire dans < 30 jours
  - Interface `DocumentValidityResult` exportée pour le frontend
- ✅ Corrigé **Next.js 15+ searchParams** dans `app/company/missions/page.tsx`
  - searchParams est maintenant une Promise (changement Next.js 15)
- 📝 Créé `PROJECT_ROADMAP.md` pour la persistance du contexte entre sessions

---

## 📚 Fichiers Importants

| Fichier | Description |
|---------|-------------|
| `architecture/CONTEXT.md` | Business rules, vision produit |
| `architecture/STACK.md` | Stack technique approuvée |
| `.cursorrules` | OMEGA Protocol v3.0 |
| `prisma/schema.prisma` | Modèles de données |
| `SECURITY_ROADMAP_ELITE.md` | Checklist sécurité détaillée |

---

## 🎯 Pour la Prochaine IA

**Si tu reprends ce projet, commence par :**

1. Lire ce fichier (`PROJECT_ROADMAP.md`)
2. Lire `architecture/CONTEXT.md` (business rules)
3. Lire `.cursorrules` (OMEGA Protocol)
4. Regarder la section "PROCHAINES ÉTAPES" ci-dessus
5. Continuer avec la prochaine tâche marquée ⬜ TODO

---

*Fichier auto-généré - Mettre à jour après chaque session de développement*
