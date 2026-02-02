# BUSINESS CONTEXT

## 📋 PRODUCT VISION
[REMPLISSEZ ICI EN 2-3 PHRASES CE QUE FAIT VOTRE APPLICATION]

Exemple :
> Une plateforme SaaS B2B qui permet aux entreprises de gérer leurs factures, 
> devis et comptabilité de manière automatisée. Notre valeur ajoutée est 
> l'intégration directe avec les banques françaises pour la réconciliation bancaire.

---

## 👥 CORE USERS & ROLES

### User Personas
1. **Admin** (Le propriétaire de l'entreprise)
   - Accès complet
   - Gère les utilisateurs et les abonnements
   - Voit les analytics

2. **Manager** (Chef d'équipe)
   - Peut créer et valider des documents
   - Accès lecture à tout, écriture limité

3. **User** (Employé standard)
   - Peut créer des brouillons
   - Ne peut pas valider

4. **Client** (Utilisateur externe)
   - Accès limité à ses propres données
   - Peut payer des factures

---

## 🎯 CORE FEATURES (MVP)

### Must-Have (v1.0)
- [ ] Authentification (email/password + OAuth Google)
- [ ] Création de profil utilisateur
- [ ] Dashboard avec métriques de base
- [ ] [AJOUTEZ VOS FEATURES CRITIQUES ICI]

### Nice-to-Have (v1.1)
- [ ] Notifications par email
- [ ] Export PDF
- [ ] [AJOUTEZ VOS FEATURES SECONDAIRES ICI]

### Future (v2.0)
- [ ] Application mobile
- [ ] Intégrations tierces (Zapier, etc.)
- [ ] [AJOUTEZ VOS FEATURES FUTURES ICI]

---

## 🔥 CRITICAL BUSINESS RULES

> **CES RÈGLES NE DOIVENT JAMAIS ÊTRE VIOLÉES PAR LE CODE**

### Règles Financières
- ❌ **Un paiement ne peut jamais être débité deux fois**
  - Utiliser idempotency keys sur Stripe
  - Logger chaque tentative de paiement

- ❌ **Un montant ne peut jamais être négatif** (sauf remboursements explicites)
  - Validation Zod sur tous les prix

- ✅ **Toutes les transactions financières doivent être loggées** (audit trail)
  - Table `financial_logs` avec retention 10 ans

### Règles de Données
- ❌ **Les données d'un client ne doivent jamais être visibles par un autre client**
  - Row Level Security (RLS) sur PostgreSQL
  - Tests E2E pour vérifier l'isolation

- ✅ **Un utilisateur doit pouvoir exporter ses données à tout moment** (RGPD)
  - Endpoint `/api/user/export`

- ✅ **Un utilisateur doit pouvoir supprimer son compte** (RGPD)
  - Endpoint `/api/user/delete` avec confirmation

### Règles Métier Spécifiques
[AJOUTEZ ICI VOS RÈGLES BUSINESS CRITIQUES]

Exemples :
- Un rendez-vous ne peut pas être réservé deux fois au même créneau
- Un stock ne peut pas être négatif
- Une commande ne peut pas être modifiée après expédition

---

## 💰 MONETIZATION MODEL

### Pricing Tiers
```
🆓 FREE PLAN
- Max 10 documents/month
- 1 utilisateur
- Support par email

💎 PRO PLAN ($29/month)
- Unlimited documents
- Max 5 utilisateurs
- Support prioritaire
- Export PDF

🏢 ENTERPRISE PLAN (Custom pricing)
- Unlimited everything
- Dedicated account manager
- SSO (Single Sign-On)
- SLA 99.9%
```

### Payment Flow
1. User clicks "Upgrade to Pro"
2. Redirected to Stripe Checkout
3. On successful payment → Webhook updates user plan
4. User redirected to `/success`

---

## 📊 KEY METRICS (What to Track)

### Business Metrics
- 📈 Monthly Recurring Revenue (MRR)
- 📈 Active users (MAU - Monthly Active Users)
- 📈 Conversion rate (Free → Pro)
- 📈 Churn rate

### Product Metrics
- ⏱️ Average session duration
- 🔄 Feature usage (which features are most used?)
- 🐛 Error rate
- ⚡ Page load time (Core Web Vitals)

---

## 🚨 EDGE CASES & GOTCHAS

> **Situations rares mais critiques que l'IA doit gérer**

### Concurrency Issues
- **Deux utilisateurs achètent le dernier article en stock simultanément**
  - Solution : Utiliser des transactions SQL avec locks

- **Un utilisateur double-clique sur "Payer"**
  - Solution : Disable button après premier click + idempotency key

### Data Integrity
- **Un webhook Stripe est reçu deux fois**
  - Solution : Vérifier la signature + check if already processed

- **Un utilisateur supprime son compte mais a des paiements en attente**
  - Solution : Soft delete (flag `deleted_at`) pendant 30 jours

### Timezone Issues
- **Un utilisateur à Tokyo réserve "demain 10h" et ça crée un rendez-vous "hier 10h"**
  - Solution : Toujours stocker en UTC, convertir à l'affichage

---

## 🎨 BRAND GUIDELINES

### Design Tokens
```javascript
// Colors
primary: '#3B82F6' (Blue)
secondary: '#8B5CF6' (Purple)
accent: '#10B981' (Green)
destructive: '#EF4444' (Red)

// Typography
headings: 'Inter', sans-serif
body: 'Inter', sans-serif
```

### Tone of Voice
- Professional mais accessible
- Éviter le jargon technique
- Messages d'erreur clairs et utiles (pas "Error 500")

---

## 🔐 COMPLIANCE REQUIREMENTS

### RGPD (Europe)
- ✅ Cookie consent banner
- ✅ Privacy Policy
- ✅ Data export feature
- ✅ Account deletion

### Accessibility (France)
- ✅ WCAG 2.1 AA compliance
- ✅ Keyboard navigation
- ✅ Screen reader compatible

### Industry-Specific
[SI APPLICABLE : FinTech → PCI-DSS, HealthTech → HIPAA, etc.]

---

## 📞 SUPPORT & ESCALATION

### Support Channels
- 📧 Email: support@example.com
- 💬 In-app chat (Intercom/Crisp)
- 📚 Documentation: docs.example.com

### Escalation Path
1. **Tier 1** : Questions générales (chatbot + email)
2. **Tier 2** : Problèmes techniques (équipe support)
3. **Tier 3** : Bugs critiques (engineering team)

### SLA (Service Level Agreement)
- Free plan : Best effort
- Pro plan : Response < 24h
- Enterprise : Response < 4h, resolution < 24h

---

## 🗺️ ROADMAP (High-Level)

### Q1 2025
- [ ] MVP launch (auth, billing, core features)
- [ ] First 100 paying customers

### Q2 2025
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard

### Q3 2025
- [ ] API for third-party integrations
- [ ] Zapier integration

---

**Last Updated:** 2025-12-29  
**This is the BRAIN of your application. Update it as your vision evolves.**
