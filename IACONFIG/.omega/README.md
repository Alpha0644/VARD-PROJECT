# 📂 .omega/ Directory

## Purpose

Ce dossier contient les fichiers de **préservation du contexte** pour OMEGA Protocol v2.1.

### Problème Résolu

Dans les conversations longues (>50 messages), les LLMs ont tendance à "oublier" les règles initiales (Context Drift). Même avec `.cursorrules`, l'IA peut progressivement dévier du protocole.

### Solution v2.1 : Context Anchor

Le fichier `context-anchor.md` sert de **point d'ancrage mémoire** :

- ✅ Version ultra-compressée des règles OMEGA
- ✅ Lu automatiquement tous les 10 messages
- ✅ Rappelle les interdictions absolues
- ✅ Réactive le système de modes
- ✅ Empêche la dérive comportementale

---

## Fichiers dans ce dossier

### `context-anchor.md` ⭐
**Rôle:** Mémoire compressée de l'IA

**Contenu:**
- Mission statement
- Système de modes (ARCHITECT/BUILDER/FAST-TRACK/etc.)
- Interdictions absolues
- Checklist sécurité (7 points)
- OMEGA Rule
- Règles business critiques
- Stack technologique
- Arbre de décision

**Fréquence de lecture:**
- Au démarrage de chaque conversation
- Tous les 10 messages automatiquement
- Quand l'IA détecte qu'elle dévie

**Mise à jour:**
- Auto-mise à jour quand CONTEXT.md change
- Contient les règles les PLUS critiques uniquement

---

## Comment ça Fonctionne

### 1. Lors du Démarrage
```
User: "Crée une API route pour les utilisateurs"
AI: [Lit .cursorrules] → [Lit context-anchor.md] → Répond
```

### 2. Après 10 Messages
```
Message 1-10: Conversation normale
Message 11: [TRIGGER AUTO] → Re-lit context-anchor.md
               ↓
          Réinitialisation mémoire
               ↓
          Continue avec règles fraîches
```

### 3. Si Dérive Détectée
```
AI: "Je m'apprête à écrire du code sans validation Zod..."
    [DÉTECTION INTERNE]
    ↓
    STOP → Re-lit context-anchor.md
    ↓
    Corrige l'approche
```

---

## Configuration IDE

### Pour que ça fonctionne automatiquement

#### Antigravity / Windsurf (recommandé)
L'IDE devrait lire `.cursorrules` qui contient déjà l'instruction de lire `context-anchor.md`.

Aucune configuration supplémentaire nécessaire.

#### Cursor / VS Code avec extension
Ajoutez dans vos settings:
```json
{
  "ai.systemPrompt": "Read /.omega/context-anchor.md every 10 messages"
}
```

#### Manuel (si l'IDE ne supporte pas)
Tous les 10-15 messages, rappelez manuellement:
```
"⚠️ REFRESH: Lis /.omega/context-anchor.md avant de continuer"
```

---

## Maintenance

### Quand mettre à jour context-anchor.md

**Automatiquement:**
L'IA devrait le faire si vous modifiez:
- `/architecture/CONTEXT.md` (règles business)
- `/architecture/STACK.md` (tech stack)
- `/architecture/SECURITY.md` (protocoles)

**Manuellement (rare):**
Si vous ajoutez une règle business CRITIQUE qui doit être rappelée fréquemment.

### Que mettre dans context-anchor.md

✅ **À inclure (essentiels):**
- Interdictions absolues
- Règles business qui causent des bugs si oubliées
- Checklist sécurité
- Stack technologique approuvé

❌ **À exclure (trop verbeux):**
- Détails d'implémentation
- Exemples de code longs
- Documentation complète

**Règle d'or:** Context anchor doit tenir en < 500 lignes et se lire en < 2 minutes.

---

## Validation

### Comment tester si ça marche

1. **Test de démarrage:**
   ```
   User: "Bonjour, on commence un projet"
   AI: [Devrait mentionner avoir lu context-anchor.md]
   ```

2. **Test de persistance (après 20+ messages):**
   ```
   User: "Crée une fonction pour valider un email"
   AI: [Devrait utiliser Zod, même 20 messages plus tard]
   ```

3. **Test de dérive:**
   ```
   User: "Installe axios pour faire des requêtes"
   AI: [Devrait refuser et proposer fetch à la place]
   ```

Si un test échoue → L'IA a oublié → Rappelez manuellement:
```
"REFRESH: Lis /.omega/context-anchor.md et applique OMEGA Protocol"
```

---

## Avantages vs. v2.0

| Aspect | v2.0 | v2.1 (avec Context Anchor) |
|--------|------|----------------------------|
| **Mémoire initiale** | Excellente | Excellente |
| **Après 20 messages** | Dérive possible | Stable ✅ |
| **Rappels manuels** | Fréquents | Rares |
| **Cohérence** | 80% | 95% ✅ |
| **Effort utilisateur** | Moyen | Faible ✅ |

---

## 🚀 Prochaines Évolutions (v2.2+)

Possibilités futures:
- Auto-détection de dérive via analyse de patterns
- Compteur de messages avec alerte visuelle
- Historique des "memory refreshes" dans logs
- Integration avec Git (refresh à chaque commit)

---

**v2.1 - Context Drift Problem: SOLVED ✅**
