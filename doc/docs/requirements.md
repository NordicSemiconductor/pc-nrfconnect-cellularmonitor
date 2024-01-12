# Minimum requirements and limitations

Cellular Monitor supports the following Development Kits (DKs) and prototyping platforms for cellular development:

- nRF91 Series DK
- Nordic Thingy:91™
- Custom boards with an nRF91 Series System in Package (SiP)

Additionally, you might need the following:

- If you are using an nRF91 Series DK or a custom board, you also need a USB cable to you Cellular Monitor.
- If you are using a DK or platform that requires a physical SIM card, you also need a SIM card supporting LTE-M or NB-IoT.

## Software requirements

Your application or sample must enable modem trace and AT commands. **Program** one of the built-in sample apps or required modem firmware (or both).
Alternatively, make sure that your application matches the following requirements:

  - The modem firmware must be at least version 1.3.3.
  - The application firmware must use nRF Connect SDK version v2.0.1 or higher. The latest version is recommended.
  - The application must enable modem trace over Universal Asynchronous Receiver/Transmitter (UART) using snippets. This enables the `CONFIG_NRF_MODEM_LIB_TRACE` Kconfig option. See [nRF Connect SDK nRF91 modem tracing with UART backend using snippets](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/device_guides/working_with_nrf/nrf91/nrf9160.html#nrf91_modem_tracing_with_uart_backend_using_snippets) for more information.
  - Your application must also include Modem Shell, the AT Host library, or AT Shell. See the following for more information.
    - Enable the [AT Host](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/libraries/modem/at_host.html) library using the Kconfig option `CONFIG_AT_HOST_LIBRARY` in the `prj.conf` file of your application. The library exposes the AT commands interface to the application and enables you to communicate with the modem using AT commands.
    - Information on Modem Shell and AT Shell can be found in [nRF Connect SDK documentation](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/index.html).

## Limitations

Some limitations apply for applications that do not use AT commands extensively.

In the first release of Cellular Monitor, the information in the **Dashboard** tab and in the **Connection Status** section are based on the AT commands in the modem trace. This limits trace data for applications that do not extensively use AT. It is recommended to use the option **Open in Wireshark** where you can find all available traffic.