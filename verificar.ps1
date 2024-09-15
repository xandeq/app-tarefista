# Script PowerShell para atualizar pacotes, verificar compatibilidade e corrigir problemas

# Exibe uma mensagem de início
Write-Host "Iniciando verificação de pacotes desatualizados e correções..." -ForegroundColor Green

# Etapa 1: Verificar se npm está instalado
if (-Not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
    Write-Host "Erro: npm não encontrado. Certifique-se de que o Node.js e npm estão instalados." -ForegroundColor Red
    exit 1
}

# Etapa 2: Verificar pacotes desatualizados
Write-Host "Verificando pacotes desatualizados..." -ForegroundColor Yellow
npm outdated

# Etapa 3: Atualizar pacotes desatualizados para a versão mais recente
Write-Host "Atualizando pacotes para a versão mais recente..." -ForegroundColor Yellow
npm update

# Etapa 4: Atualizar as dependências principais para a versão mais recente
Write-Host "Atualizando dependências principais para a versão mais recente..." -ForegroundColor Yellow
npm install --save

# Etapa 5: Atualizar as dependências de desenvolvimento
Write-Host "Atualizando dependências de desenvolvimento..." -ForegroundColor Yellow
npm install --save-dev

# Etapa 6: Verificar e corrigir problemas de compatibilidade
Write-Host "Verificando e corrigindo possíveis problemas de compatibilidade..." -ForegroundColor Yellow
npx npm-check --update-all

# Etapa 7: Reinstalar pacotes e garantir integridade
Write-Host "Reinstalando pacotes para garantir integridade..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Reinstalar dependências
Write-Host "Reinstalando dependências do projeto..." -ForegroundColor Yellow
npm install

# Etapa 8: Verificar a integridade da instalação
Write-Host "Verificando a integridade do projeto..." -ForegroundColor Yellow
npm audit fix

# Etapa 9: Limpar o cache do npm
Write-Host "Limpando o cache do npm..." -ForegroundColor Yellow
npm cache clean --force

# Etapa 10: Verificar integridade final do projeto (opcional: roda testes ou checa erros)
Write-Host "Verificando integridade da aplicação após atualizações..." -ForegroundColor Yellow
npx expo start -c # Limpar cache e rodar Expo, se for um projeto Expo
# Se não for um projeto Expo, usar apenas npm start ou outro script de build/test
# npm start

# Exibe uma mensagem de conclusão
Write-Host "Pacotes atualizados, dependências reinstaladas e integridade verificada!" -ForegroundColor Green