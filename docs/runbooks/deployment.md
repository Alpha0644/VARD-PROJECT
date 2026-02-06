# 🚀 Runbook de Déploiement - VARD

Ce document décrit la procédure pour déployer l'application VARD en production.

---

## 📋 Pré-requis

- Accès au dépôt Git (Branche `main`).
- Accès au serveur de base de données (PostgreSQL).
- Compte Pusher, Sentry et fournisseur Cloud (Vercel/AWS).

---

## ⚙️ Variables d'Environnement

Assurez-vous que les variables suivantes sont définies dans l'environnement de production :

### Core
- `DATABASE_URL`: Chaîne de connexion PostgreSQL (Pooling activé recommandé).
- `NEXTAUTH_SECRET`: Clé secrète pour signer les sessions (`openssl rand -base64 32`).
- `NEXTAUTH_URL`: URL canonique de l'application (ex: `https://app.vard.com`).

### Services Tiers
- **Pusher** (Temps réel):
  - `PUSHER_APP_ID`
  - `PUSHER_KEY`
  - `PUSHER_SECRET`
  - `PUSHER_CLUSTER` (ex: `eu`)
- **Sentry** (Monitoring):
  - `NEXT_PUBLIC_SENTRY_DSN`
  - `SENTRY_AUTH_TOKEN` (Variable de build uniquement)

### Stockage (Optionnel)
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_BUCKET_NAME`

---

## 🏗️ Procédure de Déploiement

### 1. Build de l'Application
Le build Next.js optimise les assets et vérifie les types.

```bash
npm install
npm run build
```
*Si le build échoue, vérifiez les erreurs TypeScript ou ESLint.*

### 2. Migration de Base de Données
Mettre à jour le schéma de la base de données de production.

```bash
npx prisma migrate deploy
```
**⚠️ Attention :** Cette commande applique les migrations en attente. Assurez-vous d'avoir un backup avant de l'exécuter sur une base de données avec des données réelles.

### 3. Démarrage
Lancer le serveur de production.

```bash
npm start
```

---

## 🔍 Vérifications Post-Déploiement (Sanity Check)

1. **Santé du Service** : Accéder à `/login` et vérifier que la page charge.
2. **Base de Données** : Tenter une connexion (si compte de test dispo).
3. **Monitoring** : Vérifier Sentry pour toute nouvelle erreur ("Regression").
4. **Logs** : Surveiller les logs de démarrage pour toute erreur critique.

## 🚨 Rollback

En cas de problème critique :
1. Revert du commit Git.
2. Si migration DB impliquée : `npx prisma migrate resolve` (complexe, voir doc Prisma) ou restaurer le backup DB.
3. Redéployer la version précédente stable.
