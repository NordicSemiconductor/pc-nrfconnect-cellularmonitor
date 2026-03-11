# Get started

The Cellular Monitor app is a cross-platform tool for Nordic Semiconductor nRF91 Series devices. It is used for capturing and analyzing modem traces to evaluate communication and view network parameters.

A cellular connection involves the interoperation of diverse components and scenarios. Sometimes not everything goes according to plan, and we need information about the environment. The modem of the nRF91 Series System in Package (SiP) collects data about the connection in a modem trace. With the Cellular Monitor app, you can access the trace data and use it to visualize and optimize the connection.

## Overview

The Cellular Monitor app comes with the following features:

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

## Installing the Cellular Monitor app

For installation instructions, see [Installing nRF Connect for Desktop apps](https://docs.nordicsemi.com/bundle/nrf-connect-desktop/page/installing_apps.html).

## Minimum requirements and limitations

The Cellular Monitor app supports the following Development Kits (DKs) and prototyping platforms for cellular development:

- nRF91 Series DK
- Nordic Thingy:91™
- Nordic Thingy:91 X™
- Custom boards with an nRF91 Series System in Package (SiP)

Additionally, you might need the following:

- If you are using an nRF91 Series DK or a custom board, you also need a USB cable.
- If you are using a DK or platform that requires a physical SIM card, you also need a SIM card supporting LTE-M or NB-IoT.

### Software requirements

Your application or sample must enable modem trace and AT commands.

If you are using the nRF9160 DK or Nordic Thingy:91™, you can [**Program device**](./overview.md#program-device) with one of the built-in sample apps or required modem firmware (or both).

Alternatively, for all other compatible devices (including custom boards), make sure that your application matches the following requirements:

  - The modem firmware must be at least version 1.3.3.
  - The application firmware must use nRF Connect SDK version v2.0.1 or higher. The latest version is recommended.
  - The application must enable modem trace over Universal Asynchronous Receiver/Transmitter (UART) using snippets. You can do this by [adding the `nrf91-modem-trace-uart` snippet to your application's build configuration](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/app_dev/device_guides/nrf91/nrf91_snippet.html#nrf91_modem_tracing_with_uart_backend_using_snippets), as described in the nRF Connect SDK documentation.
  - Your application must also include one of the following components from the nRF Connect SDK:

     - [Modem Shell](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/cellular/modem_shell/README.html)
     - [AT Host](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/libraries/modem/at_host.html) library

        - Enable the library using the Kconfig option `CONFIG_AT_HOST_LIBRARY` in the `prj.conf` file of your application. The library exposes the AT commands interface to the application and enables you to communicate with the modem using AT commands.

     - [AT Shell](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/libraries/modem/at_shell.html)

!!! info "Tip"
      You can use the [Quick Start app](https://docs.nordicsemi.com/bundle/nrf-connect-quickstart/page/index.html) to install some of the required components from the nRF Connect SDK.

### Limitations

Some limitations apply for applications that do not use AT commands extensively.

In the first release of the Cellular Monitor app, the information in the **Dashboard** tab and in the **Connection Status** section are based on the AT commands in the modem trace. This limits trace data for applications that do not extensively use AT. It is recommended to use the option **Open in Wireshark** where you can find all available traffic.

## Application source code

The code of the application is open source and [available on GitHub](https://github.com/NordicSemiconductor/pc-nrfconnect-cellularmonitor).
Feel free to fork the repository and clone it for secondary development or feature contributions.