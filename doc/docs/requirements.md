# Minimum requirements and limitations

Cellular Monitor supports Nordic Semiconductor Development Kits (DKs) and prototyping platforms. Your application or sample must enable modem trace and AT commands.

## Minimum Requirements

- nRF91 Series DK with a USB cable, a Nordic Thingy:91™, or a custom board with an nRF91 Series System in Package (SiP).

Either **Program** one of the built-in sample apps and/or required modem firmware, or both, or enable the following on your device:

  - The modem firmware must be at least version 1.3.3.
  - The application firmware must use nRF Connect SDK version v2.0.1 or higher. The latest version is recommended.
  - The application must enable modem trace over Universal Asynchronous Receiver/Transmitter (UART) using snippets. See [nRF Connect SDK nRF91 modem tracing with UART backend using snippets](https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/nrf/device_guides/working_with_nrf/nrf91/nrf9160.html#nrf91-modem-trace-uart-snippet) for more information.
  - Your application must also include Modem Shell, the AT Host library, or AT Shell. See the following for more information.
    - Enable the [AT Host](https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/nrf/libraries/modem/at_host.html#lib-at-host) library using the Kconfig option `CONFIG_AT_HOST_LIBRARY` in the `prj.conf` file of your application. The library exposes the AT commands interface to the application and enables you to communicate with the modem using AT commands.
    - Information on Modem Shell and AT Shell can be found in [nRF Connect SDK documentation](https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/nrf/index.html).

## Limitations

Some limitations apply for applications that do not use AT commands extensively.

In the first release of **Cellular Monitor**, the information in the **Dashboard** tab and the **Connection Status** is based on the AT commands in the modem trace. This limits trace data for applications that do not extensively use AT. It is recommended to use the option **Open in Wireshark** where you can find all available traffic.