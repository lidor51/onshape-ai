param([Parameter(Mandatory)][string]$Archive, [Parameter(Mandatory)][string]$Destination)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($Archive)
try {
    $entries = @($zip.Entries | Where-Object { $_.Name -match '\.(step|stp)$' })
    if ($entries.Count -eq 0) { throw 'ZIP_HAS_NO_STEP' }
    [System.IO.Directory]::CreateDirectory($Destination) | Out-Null
    $files = @()
    foreach ($entry in $entries) {
        if ($entry.Length -gt 100MB) { throw 'STEP_SIZE_LIMIT' }
        $filename = ('part-{0:D2}.step' -f $files.Count)
        $target = Join-Path $Destination $filename
        [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $target, $true)
        $files += @{ entry = $entry.FullName; filename = $filename; bytes = $entry.Length }
    }
    ConvertTo-Json -InputObject $files -Compress
} finally {
    $zip.Dispose()
}