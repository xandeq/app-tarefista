# Script para limpar e reinstalar dependências no projeto React Native/Expo

# Exibe uma mensagem de início
Write-Host "Iniciando limpeza do projeto e reinstalação de dependências..." -ForegroundColor Green

try {
    # Limpar o cache do npm
    Write-Host "Limpando o cache do npm..." -ForegroundColor Yellow
    npm cache clean --force

    # Verificar e remover a pasta node_modules, se ela existir
    if (Test-Path "node_modules") {
        Write-Host "Removendo a pasta node_modules..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force node_modules
    } else {
        Write-Host "A pasta node_modules não existe." -ForegroundColor Red
    }

    # Verificar e remover o arquivo package-lock.json, se ele existir
    if (Test-Path "package-lock.json") {
        Write-Host "Removendo o arquivo package-lock.json..." -ForegroundColor Yellow
        Remove-Item -Force package-lock.json
    } else {
        Write-Host "O arquivo package-lock.json não existe." -ForegroundColor Red
    }

    # Reinstalar as dependências do projeto
    Write-Host "Reinstalando dependências..." -ForegroundColor Yellow
    npm install

    # Verificar se o npx está disponível
    if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
        Write-Host "npx não está instalado ou não foi encontrado." -ForegroundColor Red
        exit 1
    }

    # Limpar cache do Expo e rodar o projeto
    Write-Host "Iniciando o projeto Expo e limpando o cache..." -ForegroundColor Yellow
    npx expo start -c
} catch {
    Write-Host "Ocorreu um erro durante o processo: $_" -ForegroundColor Red
    exit 1
}

# Exibe uma mensagem de conclusão
Write-Host "Processo concluído. O Expo deve iniciar em breve!" -ForegroundColor Green