# Script de configuración para Arquitectura de Agentes (3 Capas)
# Uso: .\setup-agents.ps1

Write-Host "🚀 Iniciando configuración de Agentes..." -ForegroundColor Cyan

# 1. Crear directorios
$dirs = @("directives", "execution", ".tmp")
foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
        Write-Host "✅ Directorio creado: $dir"
    }
}

# 2. Crear plantilla de Directiva
$directivePath = "directives/template.md"
if (-not (Test-Path $directivePath)) {
    $directiveContent = @"
# Plantilla de Directiva

## Contexto
Objetivo de alto nivel.

## Entradas
- [ ] Entrada 1

## Pasos
1. **Analizar**: Revisar archivos.
2. **Ejecutar**: Correr scripts en `execution/`.
3. **Verificar**: Validar resultados.

## Herramientas de Ejecución
- `execution/ejemplo.ts`
"@
    Set-Content -Path $directivePath -Value $directiveContent
    Write-Host "✅ Plantilla de directiva creada"
}

# 3. Crear plantilla de Ejecución (TypeScript)
$executionPath = "execution/template.ts"
if (-not (Test-Path $executionPath)) {
    $executionContent = @"
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  console.log('--- Iniciando Ejecución ---');
  try {
    console.log('Trabajando...');
    console.log('--- Completado con éxito ---');
  } catch (error) {
    console.error('--- Error en ejecución ---');
    console.error(error);
    process.exit(1);
  }
}
main();
"@
    Set-Content -Path $executionPath -Value $executionContent
    Write-Host "✅ Plantilla de ejecución creada"
}

# 4. Actualizar .gitignore
if (Test-Path ".gitignore") {
    $ignoreContent = @"

# agent architecture
/.tmp/
/execution/
/directives/
credentials.json
token.json
.env
"@
    Add-Content -Path ".gitignore" -Value $ignoreContent
    Write-Host "✅ .gitignore actualizado"
}

# 5. Instalar dependencias si existe package.json
if (Test-Path "package.json") {
    Write-Host "📦 Instalando dotenv..." -ForegroundColor Yellow
    npm install dotenv | Out-Null
    Write-Host "✅ Dependencias listas"
}

Write-Host "🎉 ¡Arquitectura lista para usar!" -ForegroundColor Green
