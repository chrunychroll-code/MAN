$git = "C:\Users\darkm\AppData\Local\MinGit\cmd\git.exe"

Write-Host "=== Git Version ==="
& $git --version

Write-Host "=== Git Init ==="
& $git init

Write-Host "=== Git Config ==="
$currentName = & $git config user.name
if (-not $currentName) {
    & $git config user.name "chrunychroll-code"
}
$currentEmail = & $git config user.email
if (-not $currentEmail) {
    & $git config user.email "chrunychroll-code@users.noreply.github.com"
}

Write-Host "=== Git Add ==="
& $git add .

Write-Host "=== Git Status ==="
& $git status --short

Write-Host "=== Git Commit ==="
& $git commit -m "feat: CivicPulse AI platform with Supabase Realtime and Google Maps vector cartography"

Write-Host "=== Git Branch -M main ==="
& $git branch -M main

Write-Host "=== Git Remote Config ==="
$remotes = & $git remote
if ($remotes -contains "origin") {
    & $git remote set-url origin https://github.com/chrunychroll-code/MAN.git
} else {
    & $git remote add origin https://github.com/chrunychroll-code/MAN.git
}

Write-Host "=== Git Push ==="
& $git push -u origin main
