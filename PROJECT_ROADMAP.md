# 🚀 VARD - NANO ROADMAP

> **Objectif :** Lancement MVP + Apps Stores  
> **Dernière MAJ :** 2026-02-02

---

## PHASE 1 : FINALISER LE WEB ✅ (FAIT)
- [x] Auth & Inscription
- [x] Création/Acceptation missions
- [x] Notifications Push Agent
- [x] Tracking GPS temps réel
- [x] Dashboard Agent/Company/Admin

---

## PHASE 2 : APP MOBILE (1 semaine)

### Étape 2.1 : Configuration Capacitor
- [ ] `npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios`
- [ ] `npx cap init` (nom: VARD, id: fr.vard.app)
- [ ] Configurer `capacitor.config.ts`

### Étape 2.2 : Build & Test Android
- [ ] `npm run build` + `npx next export`
- [ ] `npx cap add android`
- [ ] `npx cap sync`
- [ ] Ouvrir Android Studio, tester sur émulateur
- [ ] Générer APK signé

### Étape 2.3 : Publier Play Store
- [ ] Créer compte Google Play Console (25€)
- [ ] Préparer assets (icône 512x512, screenshots)
- [ ] Remplir fiche store
- [ ] Soumettre APK

### Étape 2.4 : Build iOS (optionnel)
- [ ] `npx cap add ios`
- [ ] Ouvrir Xcode (besoin Mac)
- [ ] Compte Apple Developer (99€/an)
- [ ] Soumettre App Store

---

## PHASE 3 : CONFIANCE & PRO (3 jours)

- [ ] Landing page professionnelle (page d'accueil)
- [ ] Page "À propos" avec équipe
- [ ] Mentions légales complètes
- [ ] Politique de confidentialité RGPD
- [ ] Logo & branding cohérent

---

## PHASE 4 : SÉCURITÉ (2 jours)

- [ ] Headers sécurité (CSP, HSTS)
- [ ] Rate limiting API
- [ ] Logs & monitoring (Sentry)

---

## PHASE 5 : LANCEMENT BETA (1 semaine)

- [ ] Recruter 10 agents test
- [ ] Recruter 5 entreprises test
- [ ] Corriger bugs remontés
- [ ] Itérer sur feedback

---

## 🎯 ORDRE D'EXÉCUTION

```
1. App Mobile (Capacitor)     → PRIORITÉ #1
2. Landing page pro           → PRIORITÉ #2
3. Sécurité                   → PRIORITÉ #3
4. Beta testing               → PRIORITÉ #4
```

---

## 📱 PROCHAINE ACTION

**Maintenant :** Configurer Capacitor et générer l'APK Android

Commande à exécuter :
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```
