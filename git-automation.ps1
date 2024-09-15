param(
    [string]$featureBranch, # Nome da nova feature branch
    [string]$commitMessage, # Mensagem do commit
    [string]$version         # Versão da aplicação
)

# Função para verificar o último comando
function Check-LastCommand {
    if ($LASTEXITCODE -ne 0) {
        Write-Host "O comando anterior falhou. Abortando." -ForegroundColor Red
        exit 1
    }
}

# Função para verificar se a branch existe localmente
function CheckBranchExistsLocal {
    param(
        [string]$branch
    )
    $branches = git branch --list $branch
    return $branches -ne ""
}

# Função para verificar se a branch existe remotamente
function CheckBranchExistsRemote {
    param(
        [string]$branch
    )
    $remoteBranches = git ls-remote --heads origin $branch
    return $remoteBranches -ne ""
}

# Função para checar se há algo para commitar
function CheckPendingChanges {
    $gitStatus = git status --porcelain
    return $gitStatus -ne ""
}

Write-Host "=== Iniciando automação de Git para a versão $version ===" -ForegroundColor Green

# 1. Commit na branch main
Write-Host "1. Fazendo commit na branch main" -ForegroundColor Yellow
git checkout main
Check-LastCommand

if (CheckPendingChanges) {
    git add .
    git commit -m $commitMessage
    Check-LastCommand
}
else {
    Write-Host "Nenhuma alteração para commitar na branch main. Continuando..." -ForegroundColor Yellow
}

git pull origin main --rebase  # Garantir que a branch esteja atualizada
Check-LastCommand

git push origin main
Check-LastCommand

# 2. Atualizando a develop com as mudanças da main
Write-Host "2. Atualizando a develop" -ForegroundColor Yellow
git checkout develop
Check-LastCommand

git pull origin develop --rebase  # Sincronizar develop com o repositório remoto
Check-LastCommand

git merge main
Check-LastCommand

git push origin develop
Check-LastCommand

# 3. Criar ou trocar para a feature branch
Write-Host "3. Verificando se a feature branch $featureBranch existe" -ForegroundColor Yellow

if (-not (CheckBranchExistsLocal $featureBranch)) {
    if (CheckBranchExistsRemote $featureBranch) {
        Write-Host "Branch $featureBranch já existe remotamente. Trazendo para local." -ForegroundColor Yellow
        git fetch origin $featureBranch
        Check-LastCommand
        git checkout $featureBranch
        Check-LastCommand
    }
    else {
        Write-Host "Criando a branch $featureBranch" -ForegroundColor Yellow
        git checkout -b $featureBranch
        Check-LastCommand
        # Push da nova branch para o repositório remoto
        git push origin $featureBranch
        Check-LastCommand
    }
}
else {
    Write-Host "Branch $featureBranch já existe localmente. Tentando alternar para ela." -ForegroundColor Yellow
    git checkout $featureBranch
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erro ao alternar para a branch $featureBranch. Tentando criar a branch localmente." -ForegroundColor Yellow
        git checkout -b $featureBranch
        Check-LastCommand
        # Push da nova branch para o repositório remoto
        git push origin $featureBranch
        Check-LastCommand
    }
}

# 4. Fazer merge da feature branch com a develop
Write-Host "4. Fazendo merge da feature branch com a develop" -ForegroundColor Yellow

# Certifica que estamos na develop antes de tentar o merge
git checkout develop
Check-LastCommand

# Tenta fazer o merge da feature branch com a develop
git merge $featureBranch

# Verifica o resultado do merge
if ($LASTEXITCODE -ne 0) {
    Write-Host "Não foi possível fazer merge da feature branch $featureBranch com a develop. Continuando o script." -ForegroundColor Yellow
}
else {
    Write-Host "Merge da feature branch com a develop concluído com sucesso." -ForegroundColor Green
}

# 5. Criar uma tag para a versão
Write-Host "5. Criando a tag para a versão $version" -ForegroundColor Yellow
if (git tag --list | Select-String "^v$version$") {
    Write-Host "Tag v$version já existe. Pulando criação." -ForegroundColor Yellow
}
else {
    git tag -a v$version -m "Release da versão $version"
    Check-LastCommand

    git push origin v$version
    Check-LastCommand
}

# 6. Fazer o merge da develop na main
Write-Host "6. Fazendo merge da develop com a main" -ForegroundColor Yellow
git checkout main
Check-LastCommand

git merge develop
Check-LastCommand

git push origin main
Check-LastCommand

Write-Host "=== Automação completa para a versão $version ===" -ForegroundColor Green