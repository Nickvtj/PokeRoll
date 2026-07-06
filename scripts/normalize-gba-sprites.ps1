
Add-Type -AssemblyName System.Drawing

$gbaDir = Join-Path $PSScriptRoot "..\public\sprites\gba"

$canvas = 64          # tamanho final do canvas
$target = 52.0        # dimensão máxima que o conteúdo deve ocupar
$alphaThreshold = 16  # ignora pixels quase transparentes

function Invoke-Normalize($srcDir, $outDir) {
  if (-not (Test-Path $srcDir)) { return 0 }
  if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

  $count = 0
  Get-ChildItem -Path $srcDir -Filter "*.png" | Where-Object { $_.BaseName -match '^\d+$' } | ForEach-Object {
    $bmp = New-Object System.Drawing.Bitmap($_.FullName)
    $w = $bmp.Width; $h = $bmp.Height

    $minX = $w; $minY = $h; $maxX = -1; $maxY = -1
    for ($y = 0; $y -lt $h; $y++) {
      for ($x = 0; $x -lt $w; $x++) {
        if ($bmp.GetPixel($x, $y).A -gt $alphaThreshold) {
          if ($x -lt $minX) { $minX = $x }
          if ($y -lt $minY) { $minY = $y }
          if ($x -gt $maxX) { $maxX = $x }
          if ($y -gt $maxY) { $maxY = $y }
        }
      }
    }

    $out = New-Object System.Drawing.Bitmap($canvas, $canvas)
    $g = [System.Drawing.Graphics]::FromImage($out)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half

    if ($maxX -ge $minX -and $maxY -ge $minY) {
      $cw = $maxX - $minX + 1
      $ch = $maxY - $minY + 1
      $scale = $target / [Math]::Max($cw, $ch)
      # não passa de ~1.6x para não estourar sprites minúsculos
      if ($scale -gt 1.6) { $scale = 1.6 }
      $dw = [int][Math]::Round($cw * $scale)
      $dh = [int][Math]::Round($ch * $scale)
      $dx = [int][Math]::Round(($canvas - $dw) / 2.0)
      $dy = [int][Math]::Round(($canvas - $dh) / 2.0)
      $srcRect = New-Object System.Drawing.Rectangle($minX, $minY, $cw, $ch)
      $dstRect = New-Object System.Drawing.Rectangle($dx, $dy, $dw, $dh)
      $g.DrawImage($bmp, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    }

    $g.Dispose()
    $out.Save((Join-Path $outDir ($_.BaseName + ".png")), [System.Drawing.Imaging.ImageFormat]::Png)
    $out.Dispose()
    $bmp.Dispose()
    $count++
  }
  return $count
}

$base = Invoke-Normalize $gbaDir (Join-Path $gbaDir "norm")
$shiny = Invoke-Normalize (Join-Path $gbaDir "shiny") (Join-Path $gbaDir "norm\shiny")

Write-Output "Normalizados: base=$base shiny=$shiny"
