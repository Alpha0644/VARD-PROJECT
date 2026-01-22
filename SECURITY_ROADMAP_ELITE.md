# 🛡️ SECURITY ROADMAP ELITE - Universal Edition
**Applicable à tous vos projets - Du MVP à l'application bancaire**

> **Objectif :** Transformer tout projet en forteresse numérique de niveau entreprise.  
> **Statut :** `[ ] Non démarré` `[/] En cours` `[x] Terminé`

---

## 📋 Vue d'Ensemble

| Phase | Nom | Priorité | Temps Estimé |
|-------|-----|----------|--------------|
| 0 | Hygiène Immédiate | 🔴 CRITIQUE | 2-4h |
| 1 | Forteresse du Code | 🟠 HAUTE | 1 jour |
| 2 | Infrastructure Paranoïaque | 🟡 MOYENNE | 1-2 jours |
| 3 | Sécurité Applicative Avancée | 🟠 HAUTE | 1-2 jours |
| 4 | Privacy & Conformité | 🔴 OBLIGATOIRE | 1 jour |
| 5 | Facteur Humain & Résilience | 🟠 HAUTE | 0.5 jour |
| 6 | Monitoring & Incident Response | 🔴 CRITIQUE | 0.5 jour |
| 7 | Maintenance Continue | 🟢 PERMANENT | Récurrent |

---

## 🟢 PHASE 0 : L'Hygiène Immédiate
*Arrêter l'hémorragie et sécuriser le périmètre local. À faire AVANT tout commit.*

### 0.1. Le Gardien Local (Husky + Gitleaks)
- [ ] **0.1.1** Initialiser le projet git (`git init`).
- [ ] **0.1.2** Installer Husky : `npm install --save-dev husky` et l'activer : `npx husky install`.
- [ ] **0.1.3** Créer le hook de pre-commit : `npx husky add .husky/pre-commit "npm run lint && npm test"`.
- [ ] **0.1.4** Installer Gitleaks : `brew install gitleaks` (Mac) ou télécharger binaire.
- [ ] **0.1.5** Créer `.husky/pre-commit` avec gitleaks : `gitleaks protect --staged --verbose`.
- [ ] **0.1.6** 🛑 **TEST CRITIQUE :** Créer `test_secret.txt` avec `AWS_SECRET_KEY=AKIA123456789`, essayer de commiter. **DOIT ÊTRE BLOQUÉ.**

### 0.2. Gestion des Secrets
- [ ] **0.2.1** Créer `.env.example` avec les variables requises (sans valeurs).
- [ ] **0.2.2** S'assurer que `.env` et `.env.local` sont dans `.gitignore`.
- [ ] **0.2.3** Installer un gestionnaire de secrets pour la prod (recommandé: Infisical, Doppler, ou AWS Secrets Manager).
- [ ] **0.2.4** Documenter la rotation des secrets (tous les 90 jours minimum).

### 0.3. Validation des Entrées (Zod)
- [ ] **0.3.1** Installer Zod : `npm install zod`.
- [ ] **0.3.2** Créer un dossier `/lib/schemas` ou `/src/schemas`.
- [ ] **0.3.3** Créer les schémas de base :
  - `user.schema.ts` : email (format strict), password (min 12 chars, complexité)
  - `common.schema.ts` : uuid, pagination, etc.
- [ ] **0.3.4** Créer un helper de validation : `validateInput<T>(schema, data)`.
- [ ] **0.3.5** Appliquer la validation sur TOUTES les routes d'entrée (API, Server Actions).
- [ ] **0.3.6** 🛑 **TEST CRITIQUE :** Envoyer un JSON malformé. L'API doit répondre `400 Bad Request`, pas `500`.

### 0.4. Bouclier HTTP (Helmet / Headers)
- [ ] **0.4.1** Installer Helmet (Express) : `npm install helmet` OU configurer `next.config.js` (Next.js).
- [ ] **0.4.2** Headers obligatoires :
  ```javascript
  // Pour Next.js dans next.config.js
  headers: [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-XSS-Protection', value: '1; mode=block' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
  ]
  ```
- [ ] **0.4.3** Configurer CSP (Content Security Policy) stricte - désactiver `unsafe-inline`.
- [ ] **0.4.4** Masquer le header `X-Powered-By`.
- [ ] **0.4.5** 🛑 **TEST :** Utiliser [securityheaders.com](https://securityheaders.com) - Viser grade **A** minimum.

---

## 🟡 PHASE 1 : La Forteresse du Code
*Sécuriser les ingrédients (dépendances) et le pipeline.*

### 1.1. Identité Cryptographique (Commits Signés)
- [ ] **1.1.1** Installer GPG : `brew install gpg` (Mac) ou équivalent.
- [ ] **1.1.2** Générer une clé RSA 4096 bits : `gpg --full-generate-key`.
- [ ] **1.1.3** Récupérer le KEY_ID : `gpg --list-secret-keys --keyid-format LONG`.
- [ ] **1.1.4** Exporter et ajouter à GitHub : `gpg --armor --export <KEY_ID>` → Settings > SSH & GPG Keys.
- [ ] **1.1.5** Configurer Git :
  ```bash
  git config --global user.signingkey <KEY_ID>
  git config --global commit.gpgsign true
  ```
- [ ] **1.1.6** 🛑 **TEST :** Faire un commit, vérifier qu'il apparaît "Verified" sur GitHub.

### 1.2. Audit Automatisé CI/CD
- [ ] **1.2.1** Créer `.github/workflows/security.yml` :
  ```yaml
  name: Security Audit
  on: [push, pull_request]
  jobs:
    audit:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - name: Run Trivy
          uses: aquasecurity/trivy-action@master
          with:
            scan-type: 'fs'
            severity: 'CRITICAL,HIGH'
            exit-code: '1'
        - name: Gitleaks
          uses: gitleaks/gitleaks-action@v2
          env:
            GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  ```
- [ ] **1.2.2** Ajouter `npm audit` au CI : `npm audit --audit-level=high`.
- [ ] **1.2.3** Configurer Dependabot (`.github/dependabot.yml`) pour les mises à jour auto.
- [ ] **1.2.4** 🛑 **TEST :** Introduire volontairement une dépendance vulnérable, le CI doit échouer.

### 1.3. Chiffrement Applicatif (Data at Rest)
- [ ] **1.3.1** Choisir la méthode : `crypto` natif Node.js (AES-256-GCM recommandé).
- [ ] **1.3.2** Générer une Master Key (32 bytes) - **JAMAIS DANS LE CODE**.
- [ ] **1.3.3** Créer `/lib/encryption.ts` :
  ```typescript
  import crypto from 'crypto';
  
  const ALGORITHM = 'aes-256-gcm';
  const IV_LENGTH = 16;
  const AUTH_TAG_LENGTH = 16;
  
  export function encrypt(text: string, key: Buffer): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }
  
  export function decrypt(encryptedData: string, key: Buffer): string {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
  ```
- [ ] **1.3.4** Chiffrer les données sensibles (email, tel, adresse) AVANT sauvegarde en DB.
- [ ] **1.3.5** 🛑 **TEST :** Inspecter la DB directement - les champs PII doivent être illisibles.

---

## 🟠 PHASE 2 : L'Infrastructure Paranoïaque
*Zero Trust : Le réseau est hostile.*

### 2.1. Conteneurisation Blindée
- [ ] **2.1.1** Créer un `Dockerfile` multi-stage :
  ```dockerfile
  # Build stage
  FROM node:20-alpine AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci --only=production
  COPY . .
  RUN npm run build
  
  # Production stage
  FROM gcr.io/distroless/nodejs20-debian12
  WORKDIR /app
  COPY --from=builder /app/dist ./dist
  COPY --from=builder /app/node_modules ./node_modules
  USER nonroot
  CMD ["dist/server.js"]
  ```
- [ ] **2.1.2** Ne JAMAIS utiliser `latest` pour les images de base - spécifier la version exacte.
- [ ] **2.1.3** Scanner l'image avec Trivy : `trivy image mon-image:tag`.
- [ ] **2.1.4** Configurer le conteneur en read-only avec tmpfs pour `/tmp`.

### 2.2. Isolation Réseau (Cloud)
- [ ] **2.2.1** Créer un VPC dédié à l'application.
- [ ] **2.2.2** Subnet Public : uniquement Load Balancer / CDN.
- [ ] **2.2.3** Subnet Privé : Backend, Workers, Caches.
- [ ] **2.2.4** Subnet Isolé (optionnel) : Base de données.
- [ ] **2.2.5** Security Groups stricts :
  - DB : accepte UNIQUEMENT le port depuis le Security Group Backend.
  - Backend : accepte UNIQUEMENT depuis le Load Balancer.
- [ ] **2.2.6** 🛑 **TEST :** Essayer de se connecter à la DB depuis internet. **DOIT ÉCHOUER.**

### 2.3. Base de Données Sécurisée
- [ ] **2.3.1** TLS obligatoire pour toutes les connexions (`sslmode=require`).
- [ ] **2.3.2** Utilisateur applicatif avec permissions minimales (pas de `DROP`, `CREATE`, etc.).
- [ ] **2.3.3** Activer l'audit logging (qui a fait quoi, quand).
- [ ] **2.3.4** Backups automatiques chiffrés + tester la restauration mensuellement.
- [ ] **2.3.5** Rotation des credentials DB tous les 90 jours.

---

## 🔴 PHASE 3 : Sécurité Applicative Avancée
*Protection contre les attaques ciblées.*

### 3.1. Rate Limiting & Anti-Bruteforce
- [ ] **3.1.1** Installer un rate limiter (ex: `@upstash/ratelimit` pour serverless, `express-rate-limit` sinon).
- [ ] **3.1.2** Configurer des limites par endpoint :
  ```typescript
  const RATE_LIMITS = {
    '/api/auth/login': { requests: 5, window: '15m' },      // Anti-bruteforce
    '/api/auth/register': { requests: 3, window: '1h' },    // Anti-spam
    '/api/payment': { requests: 5, window: '1m' },          // Anti-fraude
    '/api/*': { requests: 100, window: '1m' },              // Global
  };
  ```
- [ ] **3.1.3** Implémenter un délai exponentiel après X échecs de login.
- [ ] **3.1.4** Bannir temporairement les IPs avec trop d'échecs (IP blacklist Redis).
- [ ] **3.1.5** 🛑 **TEST :** Script de bruteforce - doit être bloqué après X tentatives.

### 3.2. Authentification & Session
- [ ] **3.2.1** Utiliser une lib éprouvée (Auth.js, Lucia, Clerk) - jamais custom.
- [ ] **3.2.2** Tokens JWT : expiration courte (15 min access, 7 jours refresh).
- [ ] **3.2.3** Refresh token : rotation à chaque utilisation + blacklist Redis.
- [ ] **3.2.4** Sessions : stocker côté serveur (Redis), pas juste en cookie.
- [ ] **3.2.5** Logout = invalider TOUTES les sessions (option "déconnecter partout").
- [ ] **3.2.6** 🛑 **TEST :** Voler un token expiré, essayer de l'utiliser. **DOIT ÉCHOUER.**

### 3.3. CORS & CSRF
- [ ] **3.3.1** CORS strict - lister explicitement les origines autorisées :
  ```typescript
  const ALLOWED_ORIGINS = [
    'https://monapp.com',
    'https://app.monapp.com',
    process.env.NODE_ENV === 'development' && 'http://localhost:3000',
  ].filter(Boolean);
  ```
- [ ] **3.3.2** Implémenter CSRF tokens pour les formulaires (surtout paiement, settings).
- [ ] **3.3.3** SameSite=Strict sur tous les cookies sensibles.

### 3.4. Paiement Sécurisé (Si applicable)
- [ ] **3.4.1** Utiliser Stripe/PayPal côté serveur - JAMAIS manipuler les CB.
- [ ] **3.4.2** Vérifier la signature des webhooks Stripe :
  ```typescript
  const event = stripe.webhooks.constructEvent(
    req.body,
    req.headers['stripe-signature'],
    process.env.STRIPE_WEBHOOK_SECRET
  );
  ```
- [ ] **3.4.3** Idempotency keys pour éviter les doubles paiements.
- [ ] **3.4.4** Logger tous les événements de paiement (pour audit et disputes).

### 3.5. Sécurité Mobile (Si applicable)
- [ ] **3.5.1** Stockage sécurisé des tokens : `SecureStore` (Expo) ou `react-native-keychain`.
- [ ] **3.5.2** Certificate Pinning pour prévenir les MITM.
- [ ] **3.5.3** Détection Jailbreak/Root : avertir ou bloquer.
- [ ] **3.5.4** Obfuscation du code (ProGuard Android, Hermes React Native).
- [ ] **3.5.5** Désactiver le debugging en production.

---

## 🟣 PHASE 4 : Privacy & Conformité RGPD
*Obligatoire légalement en Europe.*

### 4.1. Données Personnelles
- [ ] **4.1.1** Documenter TOUTES les données collectées (registre de traitement).
- [ ] **4.1.2** Définir une durée de rétention pour chaque type de donnée.
- [ ] **4.1.3** Implémenter le droit d'accès : endpoint `/api/user/my-data`.
- [ ] **4.1.4** Implémenter le droit à l'effacement : endpoint `/api/user/delete-account`.
- [ ] **4.1.5** Anonymiser les données après X jours (GPS positions, logs, etc.).

### 4.2. Consentement
- [ ] **4.2.1** Banner de cookies conforme (pas de dark patterns).
- [ ] **4.2.2** Cases à cocher non pré-cochées pour le marketing.
- [ ] **4.2.3** Log des consentements (qui, quand, quoi).
- [ ] **4.2.4** Permettre le retrait de consentement facilement.

### 4.3. Géolocalisation (Si applicable)
- [ ] **4.3.1** Consentement explicite AVANT d'activer le tracking.
- [ ] **4.3.2** Option de désactivation à tout moment.
- [ ] **4.3.3** Fuzzy location pour l'affichage public (H3, pas de coordonnées exactes).
- [ ] **4.3.4** Suppression automatique des positions après X jours.
- [ ] **4.3.5** Ne JAMAIS partager les positions exactes avec des tiers.

---

## 🔵 PHASE 5 : Le Facteur Humain
*Se protéger de l'erreur humaine et de l'interne.*

### 5.1. Gestion des Accès (IAM)
- [ ] **5.1.1** Principe du moindre privilège : chaque dev a accès UNIQUEMENT à ce qu'il a besoin.
- [ ] **5.1.2** Supprimer les accès "Admin" permanents.
- [ ] **5.1.3** MFA obligatoire pour tous les accès cloud/prod.
- [ ] **5.1.4** Accès temporaires (JIT) pour les opérations sensibles.
- [ ] **5.1.5** Review des accès tous les 90 jours.

### 5.2. Protection du Code Source
- [ ] **5.2.1** Verrouiller la branche `main` (pas de push direct).
- [ ] **5.2.2** Exiger les Pull Requests pour merger.
- [ ] **5.2.3** Exiger 1-2 approbations avant merge (selon taille équipe).
- [ ] **5.2.4** CI obligatoire et doit passer avant merge.
- [ ] **5.2.5** Configurer les CODEOWNERS pour les fichiers critiques.

### 5.3. Onboarding/Offboarding Sécurisé
- [ ] **5.3.1** Checklist d'onboarding (accès, formations, NDA).
- [ ] **5.3.2** Checklist d'offboarding (révoquer TOUS les accès dans les 24h).
- [ ] **5.3.3** Rotation des secrets après un départ.

---

## ⚫ PHASE 6 : Monitoring & Incident Response
*Détecter et réagir avant qu'il ne soit trop tard.*

### 6.1. Logging Centralisé
- [ ] **6.1.1** Centraliser tous les logs (ex: Axiom, Datadog, CloudWatch).
- [ ] **6.1.2** Ne JAMAIS logger les données sensibles (passwords, tokens, PII).
- [ ] **6.1.3** Logs structurés (JSON) avec correlation IDs.
- [ ] **6.1.4** Rétention des logs : 90 jours minimum pour les audits.

### 6.2. Alertes de Sécurité
- [ ] **6.2.1** Alerte : > 10 login échoués / minute depuis même IP.
- [ ] **6.2.2** Alerte : Connexion depuis un nouveau pays.
- [ ] **6.2.3** Alerte : Accès suspect aux données sensibles.
- [ ] **6.2.4** Alerte : Erreur 500 en pic inhabituel.
- [ ] **6.2.5** Canal d'alerte dédié (Slack, PagerDuty, Email).

### 6.3. Plan de Réponse aux Incidents
- [ ] **6.3.1** Documenter le processus d'incident :
  ```
  1. DÉTECTION : Qui est alerté ? Comment ?
  2. CONTAINMENT : Comment isoler la menace ?
  3. INVESTIGATION : Qui analyse ? Avec quels outils ?
  4. REMEDIATION : Qui corrige ? Validation ?
  5. COMMUNICATION : Notification CNIL (72h), utilisateurs ?
  6. POST-MORTEM : Leçons apprises, améliorations ?
  ```
- [ ] **6.3.2** Contacts d'urgence documentés (qui appeler à 3h du matin).
- [ ] **6.3.3** Simuler un incident une fois par an (tabletop exercise).

### 6.4. Backup & Disaster Recovery
- [ ] **6.4.1** Backups automatiques quotidiens (chiffrés).
- [ ] **6.4.2** Tester la restauration mensuellement.
- [ ] **6.4.3** Définir RTO (temps de recovery) et RPO (perte de données acceptable).
- [ ] **6.4.4** Documentation "Comment remonter l'app from scratch".

---

## 🔄 PHASE 7 : Maintenance Continue
*La sécurité n'est pas un état, c'est un processus. Voici les rituels à maintenir.*

### 7.1. Tâches HEBDOMADAIRES (Chaque Lundi)
- [ ] **7.1.1** Vérifier les alertes Dependabot / Snyk - merger les PRs de sécurité.
- [ ] **7.1.2** Review rapide des logs d'authentification (patterns suspects).
- [ ] **7.1.3** Vérifier que les backups automatiques fonctionnent.
- [ ] **7.1.4** Check des métriques de rate limiting (IPs bloquées, tentatives).

### 7.2. Tâches MENSUELLES (1er de chaque mois)
- [ ] **7.2.1** Exécuter un scan complet Trivy/Snyk sur le codebase.
- [ ] **7.2.2** Vérifier les headers de sécurité : [securityheaders.com](https://securityheaders.com).
- [ ] **7.2.3** Tester un backup restore (prendre 30 min, restaurer en staging).
- [ ] **7.2.4** Review des accès : qui a accès à quoi ? Révoquer les accès inutiles.
- [ ] **7.2.5** Vérifier l'expiration des certificats SSL (> 30 jours de marge).
- [ ] **7.2.6** Mettre à jour les dépendances non-critiques (`npm update`).

### 7.3. Tâches TRIMESTRIELLES (Janvier, Avril, Juillet, Octobre)
- [ ] **7.3.1** **Rotation des secrets** :
  - Master Key de chiffrement (si rotation supportée)
  - API Keys tierces (Stripe, SendGrid, etc.)
  - Credentials de base de données
  - JWT Secret
- [ ] **7.3.2** **Audit de sécurité interne** :
  ```
  Checklist Audit Trimestriel :
  □ Revoir les schémas Zod - couvrent-ils tous les endpoints ?
  □ Vérifier les logs - pas de PII loggé par erreur ?
  □ Tester le rate limiting manuellement
  □ Vérifier que le CSP est toujours strict
  □ Review des permissions IAM cloud
  ```
- [ ] **7.3.3** Simuler un login d'un "nouveau pays" - l'alerte se déclenche-t-elle ?
- [ ] **7.3.4** Review des incidents du trimestre - qu'a-t-on appris ?
- [ ] **7.3.5** Mettre à jour la documentation de sécurité si nécessaire.
- [ ] **7.3.6** Former l'équipe sur les nouvelles menaces (15-30 min).

### 7.4. Tâches ANNUELLES (Janvier)
- [ ] **7.4.1** **Pentest externe** (optionnel mais recommandé) :
  - Engager un pentester ou utiliser un service automatisé (Detectify, Intruder)
  - Budget minimum : 500-2000€ pour un audit basique
  - Alternative gratuite : utiliser OWASP ZAP en mode automatique
- [ ] **7.4.2** **Disaster Recovery Test complet** :
  ```
  Scénario : "Le serveur prod a brûlé"
  1. Recréer l'infra from scratch
  2. Restaurer le dernier backup
  3. Vérifier l'intégrité des données
  4. Mesurer le temps total (RTO réel vs objectif)
  ```
- [ ] **7.4.3** Revoir et mettre à jour le **Plan d'Incident Response**.
- [ ] **7.4.4** Inventaire complet des données collectées (mise à jour registre RGPD).
- [ ] **7.4.5** Renouveler les clés GPG si expiration proche.
- [ ] **7.4.6** Évaluer les nouvelles menaces de l'année (consulter OWASP, rapports Verizon DBIR).
- [ ] **7.4.7** Archiver les vieux logs (> 1 an) de manière sécurisée.

### 7.5. Tâches ÉVÉNEMENTIELLES (Quand ça arrive)
- [ ] **7.5.1** **Départ d'un employé/collaborateur** :
  - Révoquer TOUS les accès dans les 24h
  - Rotation immédiate des secrets partagés
  - Review des derniers commits/accès
- [ ] **7.5.2** **Nouvelle dépendance ajoutée** :
  - Vérifier la réputation du package (downloads, maintainers)
  - Scanner avec `npm audit` / Snyk
  - Vérifier la licence
- [ ] **7.5.3** **Alerte de sécurité critique (CVE)** :
  - Évaluer l'impact (sommes-nous affectés ?)
  - Patcher dans les 24-48h si critique
  - Documenter l'incident
- [ ] **7.5.4** **Déploiement majeur** :
  - Re-scan complet avant mise en prod
  - Test des headers de sécurité
  - Vérifier que les logs fonctionnent

### 📅 Template de Calendrier Sécurité

```
┌─────────────────────────────────────────────────────────────┐
│                    CALENDRIER SÉCURITÉ                      │
├─────────────────────────────────────────────────────────────┤
│ LUNDI (chaque semaine)                                      │
│   □ Review Dependabot PRs                                   │
│   □ Check logs auth                                         │
│   □ Vérifier backups                                        │
├─────────────────────────────────────────────────────────────┤
│ 1er DU MOIS                                                 │
│   □ Scan Trivy complet                                      │
│   □ Test securityheaders.com                                │
│   □ Test backup restore                                     │
│   □ Review accès                                            │
├─────────────────────────────────────────────────────────────┤
│ JANVIER / AVRIL / JUILLET / OCTOBRE                         │
│   □ Rotation secrets                                        │
│   □ Audit interne                                           │
│   □ Simulation incident                                     │
│   □ Formation équipe                                        │
├─────────────────────────────────────────────────────────────┤
│ JANVIER (annuel)                                            │
│   □ Pentest                                                 │
│   □ DR test complet                                         │
│   □ Mise à jour plan incident                               │
│   □ Inventaire RGPD                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist de Validation Finale

Avant de considérer la sécurité comme "complète" :

| Check | Description |
|-------|-------------|
| [ ] | Scan de sécurité passe sans CRITICAL |
| [ ] | Security Headers grade A ou A+ |
| [ ] | Pentest basique passé (OWASP Top 10) |
| [ ] | Données PII chiffrées en base |
| [ ] | Logs centralisés et alertes configurées |
| [ ] | Plan d'incident documenté |
| [ ] | Backup testé récemment |
| [ ] | RGPD : droits utilisateurs implémentés |

---

## 📚 Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Security Headers](https://securityheaders.com/)
- [Trivy Scanner](https://github.com/aquasecurity/trivy)
- [Gitleaks](https://github.com/gitleaks/gitleaks)

---

*Roadmap créée par ton partenaire AI - Version Elite 2026*
