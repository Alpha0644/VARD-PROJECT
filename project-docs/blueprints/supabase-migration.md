# Blueprint: Supabase PostgreSQL Migration

**Mode**: 🔴 ARCHITECT  
**Date**: 2026-01-14  
**Status**: PENDING APPROVAL  
**Risk Level**: HIGH (Database)

---

## 1. Objectif

Migrer la base de données de **SQLite (local)** vers **Supabase PostgreSQL (cloud)** pour permettre le déploiement en production.

---

## 2. Data Flow Diagram

```
[AVANT]
Next.js App → Prisma → SQLite (file:./dev.db)
                         ↓
                    Fichier local
                    (perdu au deploy)

[APRÈS]
Next.js App → Prisma → Supabase PostgreSQL
                         ↓
                    Cloud Database
                    (persistant, scalable)
```

---

## 3. Changements Requis

### 3.1 Configuration

| Fichier | Action |
|---------|--------|
| `.env` | Remplacer `DATABASE_URL` |
| `prisma/schema.prisma` | Changer provider `sqlite` → `postgresql` |

### 3.2 Schema Prisma

```diff
datasource db {
-  provider = "sqlite"
-  url      = "file:./dev.db"
+  provider = "postgresql"
+  url      = env("DATABASE_URL")
}
```

### 3.3 Migrations

```bash
# Réinitialiser les migrations pour PostgreSQL
npx prisma migrate reset --force
npx prisma migrate dev --name init_postgres
npx prisma generate
```

---

## 4. Security Checklist (7 Points)

| # | Vérification | Status |
|---|--------------|--------|
| 1 | ✅ Input validation Zod | Déjà en place |
| 2 | ✅ Auth/permissions | NextAuth configuré |
| 3 | ✅ Secrets in .env | DATABASE_URL sera dans .env |
| 4 | ⚠️ Data encrypted | Supabase chiffre au repos |
| 5 | ✅ Errors logged | Pas d'exposition stack |
| 6 | ✅ Rate limiting | Upstash/Memory fallback |
| 7 | ⚠️ Dependencies audit | À vérifier après migration |

---

## 5. Étapes d'Exécution

### Phase A: Création Supabase (Manuel - User)
1. [ ] Créer compte sur supabase.com
2. [ ] Créer nouveau projet "vard-production"
3. [ ] Copier `DATABASE_URL` (Connection String)

### Phase B: Configuration (Code)
4. [ ] Mettre à jour `.env` avec nouvelle URL
5. [ ] Modifier `prisma/schema.prisma` (provider)
6. [ ] Supprimer `prisma/migrations/` (reset)
7. [ ] Exécuter `npx prisma migrate dev`

### Phase C: Vérification
8. [ ] Vérifier connexion DB
9. [ ] Seed données de test
10. [ ] Tester CRUD complet (User, Mission, Document)

---

## 6. Rollback Plan

```bash
# Si échec, revenir à SQLite:
git checkout prisma/schema.prisma
git checkout .env
npx prisma migrate reset
```

Backup SQLite conservé: `prisma/dev.db.backup`

---

## 7. Tests Requis

| Test | Type | Fichier |
|------|------|---------|
| Connexion DB | Integration | `tests/integration/db.test.ts` |
| CRUD User | Integration | Existant |
| CRUD Mission | Integration | Existant |
| Auth Flow | E2E | `tests/e2e/auth.spec.ts` |

---

## 8. Estimation

| Tâche | Temps |
|-------|-------|
| Config Supabase | 15 min |
| Migration Prisma | 30 min |
| Tests & Vérification | 30 min |
| **Total** | **~1h15** |

---

## 9. Approbation Requise

> ⚠️ Ce blueprint modifie la base de données.
> Conformément au protocole OMEGA, je demande votre approbation avant exécution.

**Approuvez-vous ce plan ?**
