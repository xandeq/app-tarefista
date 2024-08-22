# Função para verificar erros e exibir mensagem
function Check-Error {
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: $($args[0])"
        exit $LASTEXITCODE
    }
}

# Verifica se o nome da feature branch foi fornecido
if (-not $args[0]) {
    Write-Host "Você precisa fornecer um nome para a feature branch."
    exit 1
}

$featureBranchName = "feature/$($args[0])"

# Confirma que estamos na branch develop
git checkout develop
Check-Error "Erro ao mudar para a branch develop"

git pull origin develop
Check-Error "Erro ao fazer pull da branch develop"

# Stash changes if there are uncommitted changes
if (git status --porcelain) {
    git stash
    Check-Error "Erro ao fazer stash das mudanças não commitadas"
}

# Faz o merge da develop com a main
git checkout main
Check-Error "Erro ao mudar para a branch main"

git pull origin main
Check-Error "Erro ao fazer pull da branch main"

git merge develop
Check-Error "Erro ao fazer merge da develop na main"

git push origin main
Check-Error "Erro ao fazer push da main para o origin"

# Volta para a develop
git checkout develop
Check-Error "Erro ao mudar para a branch develop"

# Apply the stashed changes
if (git stash list) {
    git stash pop
    Check-Error "Erro ao aplicar as mudanças do stash"
}

# Cria a feature branch
git checkout -b $featureBranchName
Check-Error "Erro ao criar a feature branch"

# Adiciona os arquivos, comita e faz push
git add .
Check-Error "Erro ao adicionar arquivos na feature branch"

git commit -m "Trabalhando na $featureBranchName"
Check-Error "Erro ao comitar na feature branch"

git push origin $featureBranchName
Check-Error "Erro ao fazer push da feature branch"

# Volta para a main para finalizar o processo
git checkout main
Check-Error "Erro ao mudar para a branch main"

git add .
Check-Error "Erro ao adicionar arquivos na main"

git commit -m "Finalizando a $featureBranchName"
Check-Error "Erro ao comitar na main"

git push origin main
Check-Error "Erro ao fazer push da main para o origin"

git push heroku main
Check-Error "Erro ao fazer push da main para a heroku"

# Volta para a develop para continuar o fluxo
git checkout develop
Check-Error "Erro ao mudar para a branch develop"

Write-Host "GitFlow concluído com sucesso!"
