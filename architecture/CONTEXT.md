# BUSINESS CONTEXT

## 📋 PRODUCT VISION
**"Uber pour la Sécurité Privée"**
Une plateforme de mise en relation directe et instantanée entre :
1.  **Agences de Sécurité (B2B)** : Qui cherchent des agents en urgence (absentéisme, remplacements dernière minute, renforts événementiels).
2.  **Agents de Sécurité (Freelance/Indépendants)** : Qui cherchent des missions ponctuelles géolocalisées.

**Objectif Phase 1 (Growth)** : Gratuité totale pour attirer le maximum d'utilisateurs et peupler la base de données.
**Valeur Ajoutée** : Rapidité (Matching temps réel) et Conformité (Vérification stricte des cartes pro).

---

## 👥 CORE USERS & ROLES

### 1. Admin (Platform Owner)
- Validation manuelle des documents (si pas automatisé)
- Vue d'ensemble sur toutes les missions
- Gestion des utilisateurs (bannissement si "No-Show")

### 2. Agence de Sécurité (Client B2B)
- **Pré-requis** : SIREN/SIRET validé.
- **Actions** :
    - Poster une mission urgente (Type, Heure, Lieu, Tenue).
    - Voir les agents disponibles autour de la mission.
    - Valider les heures effectuées.

### 3. Agent de Sécurité (Worker)
- **Pré-requis** : Carte Professionnelle (CNAPS) + Pièce d'identité valides.
- **Actions** :
    - Recevoir des offres dans son rayon (X km).
    - Accepter/Refuser une mission ("Premier arrivé, premier servi").
    - Déclarer son début/fin de service.

---

## 🎯 CORE FEATURES (MVP)

### Must-Have (v1.0)
- [ ] **Auth & Onboarding** :
    - Inscription différenciée (Agence vs Agent).
    - Upload documents (Carte Pro, Kbis/SIREN).
    - **BLOCKER** : Compte "En attente" tant que documents pas validés.
- [ ] **Mission Dispatch** :
    - Création de mission par l'Agence.
    - Algorithme de matching géolocalisé (Rayon paramétrable).
    - Notification temps réel (Email/SMS/Push) aux agents éligibles.
- [ ] **Gestion Mission** :
    - Acceptation instantanée.
    - Check-in / Check-out (Géolocalisé pour preuve de présence).
- [ ] **Dashboard** :
    - Historique des missions.
    - Récapitulatif mensuel des heures (pour facturation).

### Future (v2.0)
- [ ] Paiement in-app (Stripe Connect).
- [ ] Système de notation (Rating Agence/Agent).
- [ ] Assurance intégrée.

---

## 🔥 CRITICAL BUSINESS RULES

> **CES RÈGLES NE DOIVENT JAMAIS ÊTRE VIOLÉES PAR LE CODE**

### 🔐 Vérification & Compliance (Zéro Tolérance)
- ❌ **Pas de mission sans Carte Pro** : Un agent ne peut JAMAIS voir ou accepter une mission si sa carte professionnelle n'est pas uploadée ET valide (date validité).
- ❌ **Pas de recrutement sans SIREN** : Une agence ne peut pas publier si son SIRET n'est pas vérifié.
- ✅ **Documents expirés = Compte suspendu** : Si la carte pro expire, l'accès est bloqué automatiquement.

### 📍 Géolocalisation & Matching
- ✅ **Rayon X km** : Les missions ne sont proposées qu'aux agents dont la position (ou le domicile) est dans le rayon défini.
- ❌ **Pas de double booking** : Un agent ne peut pas accepter deux missions sur le même créneau horaire.

### 💰 Modèle Économique (Phase 1)
- ✅ **0% Commission** : L'accès est gratuit.
- ✅ **Paiement Fin de Mois** : La plateforme génère un relevé d'heures. Le paiement se fait en dehors (ou via virement fin de mois), la plateforme sert de tiers de confiance pour le relevé.
  - *Note technique* : Préparer la structure de données pour la facturation future, même si gratuit maintenant.

---

## 💰 MONETIZATION MODEL

### Phase 1 : Acquisition (Current)
- **Gratuit** pour tous.
- Objectif : Volume d'utilisateurs.

### Phase 2 : Rétention & Revenus (Future)
- Commission sur les missions (ex: 10-20%).
- Ou Abonnement SaaS pour les agences (accès prioritaire).

---

## 📊 KEY METRICS (MVP)
- 📈 Temps moyen de "Fill Rate" (temps entre publication et acceptation).
- 📈 % de missions pourvues.
- 📈 Nombre d'agents actifs (Carte Pro valide).
- 📈 Nombre de "No-Shows" (Agents qui acceptent mais ne viennent pas).

---

## 🚨 EDGE CASES & GOTCHAS

### Annulations
- **Agent annule dernière minute** :
    - Relancer le matching immédiatement pour les autres agents.
    - Pénaliser le profil agent.

### Fraude Documentaire
- **Fausse carte pro** :
    - Prévoir validation humaine au début ou API CNAPS (si dispo).
    - Watermarking des documents uploadés.

---

## 🎨 BRAND GUIDELINES
- **Ambiance** : Sérieux, Sécuritaire, Urgent, Professionnel.
- **Couleurs** : Bleu Nuit (Sécurité), Orange (Urgence/Action).

---

**Last Updated:** 2025-12-30
**Status:** MVP Development - Phase 1 (Free Growth)
