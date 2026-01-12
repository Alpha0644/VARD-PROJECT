# OMEGA Auto-Backup Script
# Purpose: Sauvegarde automatique toutes les 10 minutes pour protection contre les erreurs
# Usage: .\tools\auto-backup.ps1

$ErrorActionPreference = "Stop"

Write-Host "🔄 OMEGA Auto-Backup System Started" -ForegroundColor Cyan
Write-Host "📁 Repository: $(Get-Location)" -ForegroundColor Gray
Write-Host "⏰ Backup Interval: 10 minutes" -ForegroundColor Gray
Write-Host "Press Ctrl+C to stop`n" -ForegroundColor Yellow

$backupCount = 0

while ($true) {
    try {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        
        # Vérifier s'il y a des changements
        $status = git status --porcelain
        
        if ($status) {
            Write-Host "[$timestamp] 💾 Changements détectés, création du backup..." -ForegroundColor Yellow
            
            # Ajouter tous les fichiers modifiés/nouveaux (sauf gitignore)
            git add -A
            
            # Créer un commit de backup
            $backupCount++
            $commitMsg = "[AUTO-BACKUP $backupCount] Sauvegarde automatique - $timestamp"
            git commit -m $commitMsg
            
            Write-Host "[$timestamp] ✅ Backup #$backupCount créé avec succès" -ForegroundColor Green
            
            # Afficher le dernier commit
            git log -1 --oneline
        } else {
            Write-Host "[$timestamp] ✨ Aucun changement à sauvegarder" -ForegroundColor Gray
        }
        
    } catch {
        Write-Host "[$timestamp] ❌ Erreur lors du backup: $_" -ForegroundColor Red
    }
    
    # Attendre 10 minutes (600 secondes)
    Write-Host "[$timestamp] ⏳ Prochaine vérification dans 10 minutes...`n" -ForegroundColor Cyan
    Start-Sleep -Seconds 600
}
