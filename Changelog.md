## 0.4.0 - 2023-02-10

### Added

-   `Dashboard` pane showing states updated based on trace events.
-   `Event Chart` component which shows trace events in time and updates
    `Dashboard` when selecting timestamps.
-   Load raw trace files to view in `Dashboard` and `Event Chart`.
-   Support for AT Commands:
    -   AT+CSCON
    -   AT+CPSMS
    -   AT%MDMEV
    -   AT%MDMEV
    -   AT+CFUN
    -   AT%XCONNSTAT
    -   AT+CEDRXRDP
    -   AT%XTIME

## 0.3.6 - 2022-11-11

### Added

-   Trace database for modem firmware v1.2.8 and 1.3.3.

## 0.3.5 - 2022-09-26

### Fixed

-   The PSM values Periodic TAU and Active time were not automatically detected
    by the trace data in Power Estimation.

## 0.3.4 - 2022-09-06

### Added

-   Trace database for modem firmware v1.1.5.

### Fixed

-   Crash on application launch.

## 0.3.3 - 2022-09-05

### Fixed

-   Missing text for modem firmware v1.3.2.

## 0.3.2 - 2022-05-30

### Added

-   Trace databases for modem firmware 1.2.7 and 1.3.2.

### Changed

-   Improve erroneous tshark log messages.

### Fixed

-   Some Linux segfaults.
-   Did not display all serialport devices.

## 0.3.1 - 2022-02-21

### Fixed

-   Stop trace when closing wireshark during live trace only.

### Changed

-   Update information text to show when tracing is ongoing.

## 0.3.0 - 2022-02-03

### Added

-   Extract data for the
    [`Online Power Profiler`](https://devzone.nordicsemi.com/power/). Can be
    gotten from the device while tracing or from an existing raw trace file.
-   Display chart and parameters from the `Online Power Profiler` service the
    new `Power Estimation` pane.
-   Assist users to get `tshark` installed if it is not present.

### Changed

-   More descriptive error message when trace conversion fails.

## 0.2.1 - 2021-12-03

### Fixed

-   Issue where application would crash on macOS if trace was first stopped,
    then Wireshark closed.

## 0.2.0 - 2021-12-02

### Added

-   Dialog window alerting users that we are trying to autodetect modem firmware
    version.
-   Option to select multiple output file formats for the same trace.
-   Named pipe functionality. Users can now Live stream pcap data in Wireshark
    if it's installed.

### Changed

-   Use new icon set.

## 0.1.0 - 2021-11-01

### Added

-   Trace database for modem firmware 1.3.1.
-   Documentation Section to `About` pane.
-   Alert message pointing to latest version of `nRF Command Line Tools`.

### Fixed

-   Issue where tracing was not stopped when device was ejected.

### Changed

-   Establish compatibility with nRF Connect for Desktop 3.8.
-   Align scrollbar design with other apps.

## 0.0.11 - 2021-08-23

### Added

-   Capture file properties to PCAP files: Hardware, OS and application.

### Fixed

-   Bug which caused conversion to `.pcap` to fail sporadically.
-   Not able to launch wireshark on Linux.

## 0.0.10 - 2021-08-02

### Fixed

-   PCAP was not showing received SIBs.

### Changed

-   App size is reduced.
-   Packet timestamp base is local computer time.

## 0.0.9 - 2021-07-09

### Added

-   User Guide section with link to introductory video.

## 0.0.8 - 2021-07-07

### Fixed

-   Starting a trace and immediately stopping could crash the app.
-   App could freeze if stopping a trace before the modem uuid version was
    detected.

### Added

-   Tooltips with URL to links.

### Changed

-   Use `.pcapng` file extension instead of `.pcap`.

## 0.0.7 - 2021-07-05

### Changed

-   App icon.

## 0.0.6 - 2021-07-02

-   Initial public release, as an unsupported, experimental preview.
