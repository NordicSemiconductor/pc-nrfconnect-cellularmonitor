# Get started

The Cellular Monitor app is a cross-platform tool for Nordic Semiconductor nRF91 Series devices. It is used for capturing and analyzing modem traces to evaluate communication and view network parameters.

A cellular connection involves the interoperation of diverse components and scenarios. Sometimes not everything goes according to plan, and we need information about the environment. The modem of the nRF91 Series System in Package (SiP) collects data about the connection in a modem trace. With the Cellular Monitor app, you can access the trace data and use it to visualize and optimize the connection.

## Installing the Cellular Monitor app

For installation instructions, see [Installing nRF Connect for Desktop apps](https://docs.nordicsemi.com/bundle/nrf-connect-desktop/page/installing_apps.html) in the nRF Connect for Desktop documentation.

## Cellular Monitor app features

- Get started quickly by programming precompiled sample apps and modem firmware to the device
- Modem trace capture - live or playback modes
- Wireshark and serial terminal emulator interfaces
- Visualization of cellular connection status
- Packet event viewer
- Extensive modem connection status dashboard with mouse-over access to detailed information
- Auto-selection of trace database
- Play back trace files from Trace Collector, nRF Util's [`trace` command](https://docs.nordicsemi.com/bundle/nrfutil/page/nrfutil-trace/guides/tracing.html), Memfault, and Real Time Transfer (RTT)
- Modem credential management

!!! note "Note"

    The Cellular Monitor app replaces the deprecated nRF Connect for Desktop apps Trace Collector and LTE Link Monitor.
    You can still play back trace files created with these legacy apps.

The Cellular Monitor app is installed and updated using [nRF Connect for Desktop](https://docs.nordicsemi.com/bundle/nrf-connect-desktop/page/index.html).

## Application source code

The code of the application is open source and [available on GitHub](https://github.com/NordicSemiconductor/pc-nrfconnect-cellularmonitor).
Feel free to fork the repository and clone it for secondary development or feature contributions.