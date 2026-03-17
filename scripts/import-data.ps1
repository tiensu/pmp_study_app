param(
    [string]$ComposeFile = 'docker-compose.yml'
)

$ErrorActionPreference = 'Stop'

Write-Host 'Running database migration inside backend container...'
docker compose -f $ComposeFile exec backend node src/db/migrate.js
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host 'Importing CSV data into PostgreSQL...'
docker compose -f $ComposeFile exec backend node src/import/run-import.js
exit $LASTEXITCODE
