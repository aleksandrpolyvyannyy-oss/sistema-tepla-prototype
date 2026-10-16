# Отдельная ссылка №2 - прототип для корректировки фото (только готовый сайт, ветка gh-pages).
Set-Location $PSScriptRoot
$repo  = 'sistema-tepla-prototype-2'
$owner = (gh api user --jq .login)
gh repo view "$owner/$repo" *> $null
if ($LASTEXITCODE -ne 0) { gh repo create $repo --public --description "Система тепла: ссылка №2 - корректировка фото" }
$env:BASE_PATH = "/$repo"
$env:PUBLIC_PROTO_NOTE = 'Ссылка №2 - корректировка фото. Серые блоки «Нужно фото» - фото, которых пока нет. Все фото и что доснять - на странице «Фото для сайта».'
npx astro build
node scripts/ghpages-postprocess.mjs
Remove-Item Env:BASE_PATH; Remove-Item Env:PUBLIC_PROTO_NOTE
Push-Location dist
if (Test-Path .git) { Remove-Item .git -Recurse -Force }
git init -b gh-pages | Out-Null
git add -A
git -c core.autocrlf=false -c core.safecrlf=false commit -q -m "Ссылка №2: корректировка фото"
git push -f "https://github.com/$owner/$repo.git" gh-pages
Remove-Item .git -Recurse -Force
Pop-Location
gh api -X POST "repos/$owner/$repo/pages" -f "source[branch]=gh-pages" -f "source[path]=/" | Out-Null
npx astro build | Out-Null
Write-Host "https://$owner.github.io/$repo/"
