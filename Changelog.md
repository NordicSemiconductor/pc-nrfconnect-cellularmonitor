## 0.0.3
- A trace DB matching the FW of the modem is now selected automatically.
  For this, it is temporarily removed that users can select a different
  trace DB themselves. This function will be added again in the future.
- Fixed: The file size while creating a PCAP tracefile is now also reported correctly.

## 0.0.2
- Show Wireshark button on all platforms (not only on Windows, but also
  on Linux and macOS).
- Enable using pure JSON files as Trace DBs (previously only .tar.gz were supported)
- Decode not only IP but also other packet types like LTE, AT and NAS.
- Use a preview of the 1.3.0 public trace DB (still only for internal use).

## 0.0.1
- Initial internal release
