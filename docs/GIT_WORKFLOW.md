# 🔄 OMEGA Git Workflow - Guide Complet

## 📋 Workflow Quotidien (Copy-Paste Ready)

### Matin : Démarrer une Nouvelle Feature

```bash
# 1. Assurez-vous d'être à jour
git checkout main
git pull origin main

# 2. Créez une nouvelle branche
git checkout -b feature/nom-de-votre-feature
# Exemples :
# git checkout -b feature/add-payment
# git checkout -b fix/login-bug
# git checkout -b refactor/clean-code

# 3. Vérifiez que vous êtes sur la bonne branche
git branch
# * feature/nom-de-votre-feature  (l'étoile montre où vous êtes)
#   main
```

---

### Pendant la Journée : Sauvegarder Régulièrement

```bash
# Toutes les 30 min - 1h :

# 1. Voir ce qui a changé
git status
# Affiche : fichiers modifiés en rouge

# 2. Ajouter les fichiers modifiés
git add .
# (le point = tous les fichiers)

# Ou ajouter fichier par fichier :
git add app/page.tsx
git add lib/payment.ts

# 3. Commit avec message clair
git commit -m "feat: add stripe payment button"

# 4. Pousser sur GitHub (backup cloud)
git push origin feature/nom-de-votre-feature
```

**Astuce Rapide :**
```bash
# Tout en une commande (add + commit)
git commit -am "fix: correct button alignment"
# Attention : n'ajoute QUE les fichiers déjà trackés
```

---

### Soir : Merger Votre Travail dans Main

```bash
# 1. Vérifier que tout est commité
git status
# Doit afficher "nothing to commit, working tree clean"

# 2. Retourner sur main
git checkout main

# 3. Récupérer les dernières modifications
git pull origin main

# 4. Merger votre branche
git merge feature/nom-de-votre-feature

# 5. Pousser la mise à jour
git push origin main

# 6. (Optionnel) Supprimer la branche feature
git branch -d feature/nom-de-votre-feature
```

---

## 🚨 Situations d'Urgence

### Cas 1 : "J'ai Cassé le Code, Je Veux Revenir en Arrière"

```bash
# Voir l'historique des commits
git log --oneline
# Affiche :
# a1b2c3d (HEAD) feat: add payment  ← Vous êtes ici (cassé)
# e4f5g6h fix: button color         ← Version qui marchait
# i7j8k9l feat: add login

# Revenir au commit qui marchait
git reset --hard e4f5g6h

# ⚠️ ATTENTION : Perd TOUT le code après ce commit !
```

**Version Sécurisée (Garde l'Historique) :**
```bash
# Créer un nouveau commit qui annule les changements
git revert a1b2c3d
# Crée un commit "Revert 'feat: add payment'"
```

---

### Cas 2 : "J'ai Commité un Secret par Accident"

```bash
# ❌ Commis : .env avec API keys

# 1. Retirer le fichier de Git (mais le garder localement)
git rm --cached .env

# 2. Ajouter au .gitignore
echo ".env" >> .gitignore

# 3. Commit la correction
git add .gitignore
git commit -m "fix: remove .env from git"

# 4. Pousser
git push origin main

# ⚠️ IMPORTANT : Le secret est toujours dans l'historique !
# Il faut regénérer la clé API compromise
```

**Si déjà pushé sur GitHub :**
```bash
# 1. Purger l'historique (DANGEREUX)
# Utilisez BFG Repo-Cleaner :
# https://rtyley.github.io/bfg-repo-cleaner/

# 2. Ou plus simple : Regénérez la clé API
# Annulez l'ancienne clé sur Stripe/AWS/etc.
```

---

### Cas 3 : "Conflit de Merge"

```bash
git merge feature/payment
# Auto-merging lib/payment.ts
# CONFLICT (content): Merge conflict in lib/payment.ts

# Ouvrir le fichier en conflit :
# Vous verrez :
<<<<<<< HEAD
const price = 100;
=======
const price = 200;
>>>>>>> feature/payment

# 1. Choisir la bonne version (ou combiner)
const price = 200;  # Gardez celle qui est correcte

# 2. Supprimer les marqueurs <<<<, ====, >>>>

# 3. Marquer comme résolu
git add lib/payment.ts
git commit -m "fix: resolve merge conflict in payment"
```

---

### Cas 4 : "J'ai Tout Cassé, Reset Total"

```bash
# Revenir à l'état du dernier commit
git reset --hard HEAD

# Ou revenir à l'état identique à GitHub
git fetch origin
git reset --hard origin/main

# ⚠️ Perd TOUTES les modifications non commitées !
```

---

## 🎯 Best Practices OMEGA

### 1. Stratégie de Branches

```
main (production)
  ↓
develop (staging - optionnel pour grands projets)
  ↓
feature/* (vos développements)
  ├─ feature/payment
  ├─ feature/auth
  └─ feature/dashboard

hotfix/* (corrections urgentes)
  └─ hotfix/critical-bug
```

**Pour débutant (simplifié) :**
```
main
  ├─ feature/payment
  └─ feature/login
```

---

### 2. Commit Message Convention

```bash
# Format :
type(scope): description

# Types :
feat     # Nouvelle fonctionnalité
fix      # Correction de bug
refactor # Amélioration du code
test     # Ajout de tests
docs     # Documentation
style    # Formatage (pas de changement logique)
chore    # Tâches (mise à jour dépendances)

# Exemples :
git commit -m "feat(auth): add google oauth login"
git commit -m "fix(payment): correct stripe webhook validation"
git commit -m "refactor(ui): extract button component"
git commit -m "test(payment): add unit tests for stripe"
git commit -m "docs(readme): update installation steps"
```

---

### 3. Quand Commiter ?

```
✅ COMMIT :
- Feature complète (même petite)
- Bug fixé et testé
- Refactoring terminé
- Avant de changer de contexte (pause, fin de journée)

❌ NE PAS COMMIT :
- Code cassé (ne compile pas)
- Tests échouent
- console.log() de debug partout
- Commentaires TODO non résolus (sauf si feature incomplète)
```

---

### 4. Protection Main Branch (GitHub)

**Settings → Branches → Add Rule :**
```yaml
Branch name pattern: main

✅ Require a pull request before merging
✅ Require status checks to pass
   - Lint
   - TypeScript Check
   - Tests
   - Build
✅ Require branches to be up to date

❌ Allow force pushes (DANGEREUX)
❌ Allow deletions
```

---

## 🔄 GitHub Integration (Cloud Backup)

### Première Fois : Lier Local → GitHub

```bash
# 1. Créer un repo sur GitHub.com
# → New Repository → "mon-projet"

# 2. Dans votre terminal local :
git remote add origin https://github.com/votre-user/mon-projet.git

# 3. Premier push
git push -u origin main

# Après, juste :
git push
```

---

### Pull Request Workflow (Pour équipes)

```bash
# 1. Créer feature branch
git checkout -b feature/payment

# 2. Faire vos commits
git commit -am "feat: add payment"

# 3. Pousser sur GitHub
git push origin feature/payment

# 4. Sur GitHub.com : Create Pull Request

# 5. Demander une review (optionnel)
# Attendre approbation

# 6. Cliquer "Merge Pull Request"

# 7. Supprimer la branche sur GitHub

# 8. Localement :
git checkout main
git pull origin main
git branch -d feature/payment
```

---

## 📊 Commandes Git Essentielles (Cheat Sheet)

```bash
# CONFIGURATION
git config --global user.name "Nom"
git config --global user.email "email"

# INITIALISATION
git init                          # Nouveau projet
git clone <url>                   # Copier un projet existant

# BRANCHES
git branch                        # Lister les branches
git branch <nom>                  # Créer une branche
git checkout <nom>                # Changer de branche
git checkout -b <nom>             # Créer + changer
git branch -d <nom>               # Supprimer branche

# MODIFICATIONS
git status                        # Voir les changements
git add <fichier>                 # Ajouter un fichier
git add .                         # Ajouter tout
git commit -m "message"           # Sauvegarder
git commit -am "message"          # Add + commit (fichiers trackés)

# SYNCHRONISATION
git push origin <branche>         # Envoyer sur GitHub
git pull origin <branche>         # Récupérer de GitHub
git fetch                         # Récupérer sans merger

# HISTORIQUE
git log                           # Voir historique
git log --oneline                 # Version courte
git log --graph --all             # Version visuelle

# ANNULATION
git reset --hard HEAD             # Annuler modifications
git reset --hard <commit>         # Revenir à un commit
git revert <commit>               # Créer commit d'annulation

# COMPARAISON
git diff                          # Voir différences
git diff <fichier>                # Diff d'un fichier
git diff <branch1>..<branch2>     # Comparer 2 branches

# MERGE
git merge <branche>               # Fusionner une branche
git merge --abort                 # Annuler un merge conflictuel
```

---

## 🎯 Checklist Avant Chaque Commit

```
□ Le code compile sans erreur
□ Les tests passent (npm run test)
□ Pas de console.log() de debug
□ Pas de secrets hardcodés (.env)
□ Message de commit clair
□ Fichiers non nécessaires exclus (.gitignore)
```

---

## 💡 Astuces Pro

### Git Aliases (Raccourcis)

```bash
# Ajouter dans ~/.gitconfig
[alias]
  st = status
  co = checkout
  br = branch
  ci = commit
  unstage = reset HEAD --
  last = log -1 HEAD
  visual = log --graph --all --oneline

# Utilisation :
git st        # au lieu de git status
git co main   # au lieu de git checkout main
```

---

### Undo Last Commit (Garder les Changements)

```bash
git reset --soft HEAD~1
# Le commit est annulé, mais fichiers modifiés restent
```

---

### Stash (Sauvegarder Sans Commiter)

```bash
# Mettre de côté temporairement
git stash

# Changer de branche, faire autre chose...

# Récupérer les changements
git stash pop
```

---

## 🎉 Résumé : Workflow OMEGA Complet

```bash
# ==== MATIN ====
git checkout main
git pull origin main
git checkout -b feature/nouvelle-feature

# ==== PENDANT LA JOURNÉE ====
# ... code code code ...
git add .
git commit -m "feat: add X"
git push origin feature/nouvelle-feature

# Répéter toutes les 30 min

# ==== SOIR ====
git checkout main
git pull origin main
git merge feature/nouvelle-feature
git push origin main

# ==== SI CRASH ====
git log --oneline
git reset --hard <commit-qui-marchait>
```

---

**En gros :**
- Commit = sauvegarde locale
- Push = sauvegarde cloud (GitHub)
- Branch = version parallèle sans risque
- Merge = fusionner 2 versions

**Règle d'or :** Commit souvent, push toujours, branch pour chaque feature ✅
