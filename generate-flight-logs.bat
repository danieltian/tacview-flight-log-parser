@echo off

rem Export flight logs from telemetry files

for %%F in (dir *.acmi) do (
  if exist %%F.xml (
    echo %%F.xml already exists, skipping.
  ) else (
    echo Exporting flight log for %%F...
    "C:\Program Files (x86)\Tacview\Tacview.exe" -Open:"%%F" -ExportFlightLog:"%%F.xml" -Quiet -Quit
  )
)
