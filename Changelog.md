## 1.0.2 - 2023-06-14

### Changed

-   Always ask user which trace database to use when reading from file.

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
