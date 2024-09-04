param(
    [string]$featureBranch,  # Nome da nova feature branch
    [string]$commitMessage   # Mensagem do commit
)

# Função para verificar o último comando
function Check-LastCommand {
    if ($LASTEXITCODE -ne 0) {
        Write-Host "O comando anterior falhou. Abortando." -ForegroundColor Red
        exit 1
    }
}

$version = "1.0.9"

Write-Host "=== Iniciando automação de Git para a versão $version ===" -ForegroundColor Green

# 1. Commit na branch main
Write-Host "1. Fazendo commit na branch main" -ForegroundColor Yellow
git checkout main
Check-LastCommand

git add .
git commit -m $commitMessage
Check-LastCommand

git push origin main
Check-LastCommand

# 2. Atualizando a develop com as mudanças da main
Write-Host "2. Atualizando a develop" -ForegroundColor Yellow
git checkout develop
Check-LastCommand

git merge main
Check-LastCommand

git push origin develop
Check-LastCommand

# 3. Criar uma feature branch
Write-Host "3. Criando a feature branch: $featureBranch" -ForegroundColor Yellow
git checkout -b $featureBranch
Check-LastCommand

git add .
git commit -m $commitMessage
Check-LastCommand

git push origin $featureBranch
Check-LastCommand

# 4. Voltar para develop e fazer merge da feature branch
Write-Host "4. Fazendo merge da feature branch com a develop" -ForegroundColor Yellow
git checkout develop
Check-LastCommand

git merge $featureBranch
Check-LastCommand

git push origin develop
Check-LastCommand

# 5. Criar uma tag para a versão
Write-Host "5. Criando a tag para a versão $version" -ForegroundColor Yellow
git tag -a v$version -m "Release da versão $version"
Check-LastCommand

git push origin v$version
Check-LastCommand

# 6. Fazer o merge da develop na main
Write-Host "6. Fazendo merge da develop com a main" -ForegroundColor Yellow
git checkout main
Check-LastCommand

git merge develop
Check-LastCommand

git push origin main
Check-LastCommand

Write-Host "=== Automação completa para a versão $version ===" -ForegroundColor Green
