# Minimum requirements and limitations

The {{app_name}} supports the following Development Kits (DKs) and prototyping platforms for cellular development:

- nRF91 Series DK
- Nordic Thingy:91™
- Nordic Thingy:91 X™
- Custom boards with an nRF91 Series System in Package (SiP)

Additionally, you might need the following:

- If you are using an nRF91 Series DK or a custom board, you also need a USB cable.
- If you are using a DK or platform that requires a physical SIM card, you also need a SIM card supporting LTE-M or NB-IoT.

## Software requirements

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

## Limitations

Some limitations apply for applications that do not use AT commands extensively.

In the first release of the {{app_name}}, the information in the **Dashboard** tab and in the **Connection Status** section are based on the AT commands in the modem trace. This limits trace data for applications that do not extensively use AT. It is recommended to use the option **Open in Wireshark** where you can find all available traffic.