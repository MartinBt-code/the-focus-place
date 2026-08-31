param(
  [string[]]$FramePaths,
  [int[]]$DelaysCentis,
  [string]$OutPath,
  [int]$Width = 540,
  [int]$Height = 960
)

Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName System.Drawing

# --- Build one multi-frame GIF via GifBitmapEncoder (each frame gets its own local palette) ---
$encoder = New-Object System.Windows.Media.Imaging.GifBitmapEncoder

foreach ($path in $FramePaths) {
  $bmp = New-Object System.Drawing.Bitmap($path)
  $resized = New-Object System.Drawing.Bitmap($Width, $Height)
  $g = [System.Drawing.Graphics]::FromImage($resized)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($bmp, 0, 0, $Width, $Height)
  $g.Dispose(); $bmp.Dispose()

  $ms = New-Object System.IO.MemoryStream
  $resized.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
  $ms.Position = 0
  $decoder = New-Object System.Windows.Media.Imaging.PngBitmapDecoder($ms, [System.Windows.Media.Imaging.BitmapCreateOptions]::None, [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad)
  $frame = [System.Windows.Media.Imaging.BitmapFrame]::Create($decoder.Frames[0])
  $encoder.Frames.Add($frame)
  $resized.Dispose()
}

$tmpPath = [System.IO.Path]::GetTempFileName()
$fs = [System.IO.File]::Open($tmpPath, [System.IO.FileMode]::Create)
$encoder.Save($fs)
$fs.Close()

$bytes = [System.IO.File]::ReadAllBytes($tmpPath)
Remove-Item $tmpPath -Force

# --- Parse GIF structure to find each Image Descriptor (0x2C) start/end, then splice in
#     a Graphic Control Extension before each frame, plus a NETSCAPE loop extension once. ---

function Skip-SubBlocks([byte[]]$b, [int]$pos) {
  while ($b[$pos] -ne 0) {
    $pos = $pos + 1 + $b[$pos]
  }
  return $pos + 1
}

$pos = 6 # after "GIF89a"/"GIF87a" header
# Logical Screen Descriptor: 7 bytes (width2,height2,packed,bg,aspect)
$packed = $bytes[$pos + 4]
$pos += 7
if ($packed -band 0x80) {
  $gctSize = [Math]::Pow(2, ($packed -band 0x07) + 1) * 3
  $pos += [int]$gctSize
}
$headerEnd = $pos

$frameStarts = @()
$frameEnds = @()

while ($bytes[$pos] -ne 0x3B) {
  if ($bytes[$pos] -eq 0x21) {
    # Extension: 21 <label> then sub-blocks
    $pos += 2
    $pos = Skip-SubBlocks $bytes $pos
  } elseif ($bytes[$pos] -eq 0x2C) {
    $start = $pos
    $imgPacked = $bytes[$pos + 9]
    $pos += 10
    if ($imgPacked -band 0x80) {
      $lctSize = [Math]::Pow(2, ($imgPacked -band 0x07) + 1) * 3
      $pos += [int]$lctSize
    }
    $pos += 1 # LZW min code size
    $pos = Skip-SubBlocks $bytes $pos
    $frameStarts += $start
    $frameEnds += $pos
  } else {
    throw "Unexpected byte 0x$($bytes[$pos].ToString('X2')) at offset $pos"
  }
}

if ($frameStarts.Count -ne $FramePaths.Count) {
  throw "Parsed $($frameStarts.Count) frames but expected $($FramePaths.Count)"
}

# Netscape looping extension (loop forever)
$netscape = [byte[]](0x21,0xFF,0x0B,
  0x4E,0x45,0x54,0x53,0x43,0x41,0x50,0x45,0x32,0x2E,0x30, # "NETSCAPE2.0"
  0x03,0x01,0x00,0x00,0x00)

$out = New-Object System.Collections.Generic.List[byte]
$out.AddRange([byte[]]$bytes[0..($headerEnd-1)])
$out.AddRange($netscape)

for ($i = 0; $i -lt $frameStarts.Count; $i++) {
  $delay = $DelaysCentis[$i]
  $lo = $delay -band 0xFF
  $hi = ($delay -shr 8) -band 0xFF
  $gce = [byte[]](0x21,0xF9,0x04,0x04,$lo,$hi,0x00,0x00) # disposal=1 (do not dispose), no transparency
  $out.AddRange($gce)
  $s = $frameStarts[$i]; $e = $frameEnds[$i] - 1
  $out.AddRange([byte[]]$bytes[$s..$e])
}
$out.Add(0x3B)

[System.IO.File]::WriteAllBytes($OutPath, $out.ToArray())
Write-Output "Wrote $OutPath ($($out.Count) bytes, $($frameStarts.Count) frames)"
