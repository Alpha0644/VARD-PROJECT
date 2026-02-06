# 🧪 Guide de Tests - VARD

Ce projet utilise une stratégie de test hybride conforme au protocole OMEGA :
- **Unitaires** (Vitest) : Pour la logique métier, les utilitaires et les composants isolés.
- **End-to-End** (Playwright) : Pour les flux critiques utilisateurs et les interactions complexes.

---

## 🚀 Lancer les Tests

### 1. Pré-requis
Assurez-vous que les dépendances sont installées et que la base de données est prête.
```bash
npm install
npm run db:push
```

### 2. Tests Unitaires (Vitest)
Exécutent la logique backend et les composants React isolés.
```bash
# Lancer tous les tests unitaires
npm run test

# Mode watch (développement)
npm run test:watch
```

### 3. Tests E2E (Playwright)
Testent l'application complète dans un navigateur réel (Chromium).

**⚠️ Important :** Les tests E2E nécessitent une base de données de test propre.

```bash
# 1. Seeder la base de données de test (CRITIQUE)
npm run seed:e2e

# 2. Lancer les tests (Headless - Rapide)
npx playwright test

# 3. Lancer les tests avec UI (Pour débogage)
npx playwright test --ui

# 4. Voir le rapport détaillé
npx playwright show-report
```

---

## 📂 Structure des Tests

```
tests/
├── unit/               # Tests Vitest
│   ├── api-error.test.ts
│   └── ...
├── e2e/                # Tests Playwright
│   ├── auth.spec.ts    # Inscription/Login
│   ├── mission-lifecycle.spec.ts # Flux complet Mission
│   └── helpers/        # Utilitaires (auth.ts, etc.)
└── setup.ts            # Configuration globale Vitest
```

## 📝 Écrire un Nouveau Test

### E2E (Playwright)
1. Créer un fichier dans `tests/e2e/`.
2. Utiliser les helpers `tests/e2e/helpers/auth.ts` pour la connexion.
3. Utiliser `data-testid` dans le code source pour des sélecteurs stables.

**Exemple :**
```typescript
test('Agent accept mission', async ({ page }) => {
  await loginUser(page, 'agent@test.com', 'pass')
  await page.click('[data-testid="mission-accept-btn"]')
  await expect(page).toHaveURL(/dashboard/)
})
```

### Unitaire (Vitest)
1. Créer un fichier `.test.ts` dans `tests/unit/`.
2. Mocker les dépendances externes (Prisma, S3, etc.).

---

## 🔍 Dépannage

**Erreur :** `Test timeout of 30000ms exceeded`
- **Cause :** L'application est lente à démarrer ou un élément n'apparaît pas.
- **Solution :** Vérifiez que le serveur de dev tourne bien (`npm run dev`) ou augmentez le timeout dans `playwright.config.ts`.

**Erreur :** `Error: expect(locator).toBeVisible() failed`
- **Cause :** Sélecteur incorrect ou état inattendu.
- **Solution :** Utilisez `npx playwright test --debug` pour inspecter le DOM.
