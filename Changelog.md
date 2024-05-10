## 2.3.1 - 2024-05-13

### Added

-   Support for ARM native executables.

## 2.3.0 - 2024-04-18

### Changed

-   Updated documentation links to point to the TechDocs platform.
-   Reworked the Feedback tab to be a dialog in the About tab (Give Feedback).

## 2.2.0 - 2024-03-13

### Added

-   Persist state of the Show Log panel.

### Changed

-   Updated `nrfutil device` to v2.1.1.

## 2.1.0 - 2023-12-07

### Added

-   Trace database v2.0.0 and v2.0.0-FOTA for nRF91x1DK.

### Changed

-   Update nrfutil device to 2.0.2.

## 2.0.1 - 2023-10-12

### Added

-   Warning for known issue when resetting nRF9161 DK multiple times during a
    trace.

## 2.0.0 - 2023-09-29

### Added

-   Trace database v2.0.0-beta for nRF9161DK.
-   Link to official documentation in the About pane.
-   Option to **Refresh dashboard on start**, which will refresh the dashboard
    after 5 seconds of starting a trace. The option is only available if
    Wireshark is disabled.
-   Warning in the SidePanel when Wireshark executable is not found.
-   Option to specify path to a Wireshark executable.

### Fixed

-   In some cases, the **Refresh dashboard** button was visible after
    deselecting device.
-   Powering off or deselecting device while tracing, and before receiving any
    packets, would leave the app in a strange state, where it did not look like
    the device was deselected.
-   Programming modem firmware failed if target directory did not exist.

### Changed

-   From **nrf-device-lib-js** to **nrfutil device**, as a backend for
    interacting with devices.
-   Toggles inside Chart Options are now displayed closer to its label.
-   "nRF Connect for Cloud" changed to "nRF Cloud".
-   Font size and color in the Packet Event Viewer, and as a consequence the
    size of the Packet Event Viewer.

## 1.0.3 - 2023-07-03

### Added

-   Option to auto-detect trace database when reading trace file.
-   Option to deselect **Terminal Serial Port**.
-   Dashboard field values can be copied by clicking on the value. The value
    will have a blue background when it is possible to copy.
-   Signal quality properties (RSRP, RSRQ, SNR) will show an indication of
    Excellent, Good, Fair, or Bad signal strength when it is available.

### Fixed

-   Programming sample could fail the first time programming an application.
-   Signal quality properties (RSRP, RSRQ, SNR) showed incorrect decibel value
    when it should have shown "Not known or not detectable".

### Changed

-   Renamed **Serial port trace capture** to **Modem trace serial port**.
-   When selected device only exposes one serial port, the app will assume it
    will be used for modem trace. Hence, it will only auto-select serial port
    for the **Modem trace serial port**, and will not select anything for
    **Terminal serial port**.
-   Dashboard card title from Power Saving Mode to Power Saving Features.

## 1.0.2 - 2023-06-15

### Fixed

-   Could not read trace file in v1.0.1.

### Changed

-   Always ask what trace database to use when reading trace file.

## 1.0.1 - 2023-06-14

### Added

-   Modem Firmware v1.3.5, and trace database for v1.3.5.

## 1.0.0 - 2023-06-08

### Added

-   Power Saving Mode values are now shown as decimal time units, days, hours,
    minutes, seconds, with the bit mask shown in parentheses. Example, REQUESTED
    PERIODIC TAU: 1 hour (00100001)
-   Visual effect to dashboard fields that are updated, in order to make it
    easier to notice when a change has been made.
-   Certificate Manager from the Link Monitor app.

### Changed

-   The Power Saving Mode values Periodic Tau and Active Timer had default
    values, but will now show as 'Unknown' until we are able to detect otherwise
    in the trace.
-   The Power Saving Mode value LEGACY PROVIDED PERIODIC TAU was always shown,
    but is now only shown if PROVIDED ACTIVE TIMER is activated, and PROVIDED
    PERIODIC TAU is deactivated and LEGACY PROVIDED PERIODIC TAU is activated.

## 0.9.0 - 2022-05-24

### Added

-   Supported devices: nRF9160DK and Thingy91.

The following new capabilities are added:

-   Capture traces and view them in Wireshark for in-depth analysis.
-   Connection Status overview - for high-level troubleshooting of the
    connection.
-   Trace Event Viewer - view sent and received packets as they are read from
    the modem trace.
-   Monitoring Dashboard - view detailed status information from the device,
    modem, SIM card, LTE network, and Packet Data Network.
-   Program modem firmware and sample applications directly from the app.
