# Публикация прототипа на GitHub Pages.
# Запуск:  powershell -ExecutionPolicy Bypass -File deploy-ghpages.ps1
# Сайт будет публичным (бесплатные Pages работают только с публичным репозиторием),
# но закрыт от поисковиков: noindex на всех страницах и Disallow в robots.txt.
Set-Location $PSScriptRoot
$repo  = 'sistema-tepla-prototype'
$owner = (gh api user --jq .login)
function Check($step) { if ($LASTEXITCODE -ne 0) { Write-Host "ОШИБКА на шаге: $step" -ForegroundColor Red; exit 1 } }

# 1. Исходники -> ветка main
if (-not (Test-Path .git)) { git init -b main | Out-Null }
git add -A
git -c core.autocrlf=false -c core.safecrlf=false commit -q -m "Прототип сайта «Система тепла» на Astro"
$hasOrigin = (git remote) -contains 'origin'
if (-not $hasOrigin) {
  gh repo create $repo --public --source . --remote origin --description "Прототип сайта «Система тепла» (Astro)"
  Check "создание репозитория"
}
git push -u origin main
Check "отправка исходников"

# 2. Сборка под подпапку /sistema-tepla-prototype/
$env:BASE_PATH = "/$repo"
npx astro build
Check "сборка"
node scripts/ghpages-postprocess.mjs
Check "подготовка к Pages"
Remove-Item Env:BASE_PATH

# 3. Готовый сайт -> ветка gh-pages
Push-Location dist
if (Test-Path .git) { Remove-Item .git -Recurse -Force }
git init -b gh-pages | Out-Null
git add -A
git -c core.autocrlf=false -c core.safecrlf=false commit -q -m "Публикация прототипа"
git push -f "https://github.com/$owner/$repo.git" gh-pages
$pushCode = $LASTEXITCODE
Remove-Item .git -Recurse -Force
Pop-Location
if ($pushCode -ne 0) { Write-Host "ОШИБКА на шаге: отправка сайта" -ForegroundColor Red; exit 1 }

# 4. Включить Pages из ветки gh-pages (если уже включено — ошибку игнорируем)
gh api -X POST "repos/$owner/$repo/pages" -f "source[branch]=gh-pages" -f "source[path]=/" | Out-Null
Write-Host ""
Write-Host "Готово. Через 1-2 минуты сайт откроется по адресу:" -ForegroundColor Green
Write-Host "https://$owner.github.io/$repo/"
