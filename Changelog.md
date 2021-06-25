## 0.0.4
- Added: Cards with information about usage of app and expected output 
- Added: Instructions section in sidepanel containing links to getting 
  started guides and purchasing

## 0.0.3
- Fixed: The file size while creating a PCAP tracefile is now also reported correctly.
- Updated styling of the side panel.
- Persist which serial port was used the last time for a device.
- Preselect the most likely serial port for getting the trace.
- Show the advanced options in the side panel even if no device is connected.
- Disable selecting a different trace file format while tracing is in progress.

## 0.0.2
- Show Wireshark button on all platforms (not only on Windows, but also
  on Linux and macOS).
- Enable using pure JSON files as Trace DBs (previously only .tar.gz were supported)
- Decode not only IP but also other packet types like LTE, AT and NAS.
- Use a preview of the 1.3.0 public trace DB (still only for internal use).

## 0.0.1
- Initial internal release
