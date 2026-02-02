# 🌐 Git Configuration (Windows PowerShell)
# Copy this to: .git\hooks\pre-commit (remove .sample extension if exists)

# Note: On Windows, Git hooks need to be executable
# Use Git Bash or enable WSL for best compatibility

# Run the secret check script
& "$PSScriptRoot\..\..\tools\check-secrets.sh"

if ($LASTEXITCODE -ne 0) {
  exit 1
}

exit 0
