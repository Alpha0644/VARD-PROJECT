# OMEGA Restore Backup Script
# Purpose: Restaurer le projet à une version précédente en cas de problème
# Usage: .\tools\restore-backup.ps1 [nombre de commits à reculer]

param(
    [Parameter(Mandatory=$false)]
    [int]$StepsBack = 1
)

$ErrorActionPreference = "Stop"

Write-Host "🔙 OMEGA Backup Restoration Tool" -ForegroundColor Cyan
Write-Host "═══════════════════════════════`n" -ForegroundColor Gray

# Afficher les derniers commits
Write-Host "📋 Derniers commits (backups):`n" -ForegroundColor Yellow
git log --oneline -n 10

Write-Host "`n" -NoNewline

# Vérifier s'il y a des changements non commités
$status = git status --porcelain
if ($status) {
    Write-Host "⚠️  ATTENTION: Changements non sauvegardés détectés!" -ForegroundColor Red
    Write-Host "Voulez-vous les sauvegarder d'abord? (O/N): " -NoNewline -ForegroundColor Yellow
    $response = Read-Host
    
    if ($response -eq "O" -or $response -eq "o") {
        git add -A
        git commit -m "[EMERGENCY-SAVE] Sauvegarde d'urgence avant restoration"
        Write-Host "✅ Sauvegarde d'urgence créée" -ForegroundColor Green
    }
}

# Demander confirmation
Write-Host "`n🔄 Vous allez revenir $StepsBack commit(s) en arrière" -ForegroundColor Yellow
Write-Host "Confirmer? (O/N): " -NoNewline -ForegroundColor Red
$confirm = Read-Host

if ($confirm -eq "O" -or $confirm -eq "o") {
    try {
        # Créer une branche de backup au cas où
        $backupBranch = "backup-before-restore-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        git branch $backupBranch
        Write-Host "✅ Branche de sécurité créée: $backupBranch" -ForegroundColor Green
        
        # Revenir en arrière (soft reset pour garder les changements)
        git reset --soft HEAD~$StepsBack
        
        Write-Host "`n✅ Restoration réussie!" -ForegroundColor Green
        Write-Host "📍 Position actuelle:" -ForegroundColor Cyan
        git log -1 --oneline
        
        Write-Host "`n💡 Vos fichiers sont maintenant à l'état du commit ci-dessus" -ForegroundColor Yellow
        Write-Host "💡 Pour annuler cette restoration: git reset --soft $backupBranch" -ForegroundColor Yellow
        
    } catch {
        Write-Host "`n❌ Erreur lors de la restoration: $_" -ForegroundColor Red
        Write-Host "💡 Votre code n'a pas été modifié" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Restoration annulée" -ForegroundColor Yellow
}
