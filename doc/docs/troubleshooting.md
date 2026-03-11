# Troubleshooting

These troubleshooting instructions can help you fix issues you might encounter in the Cellular Monitor app.

Check the app's [Minimum requirements and limitations](./index.md#minimum-requirements-and-limitations).

## I do not see **Program device**

Check if you are using one of the [supported devices](index.md#minimum-requirements-and-limitations).
The [**Program device**](overview.md#program-device) is only visible when using the nRF9160 DK or Nordic Thingy:91™.

## Trace data is not displayed or the file size does not increase
  - Check the trace serial port used.

     The number and function of the serial ports depends on the selected device and the onboard application firmware.

     The virtual serial ports on a Nordic Semiconductor Development Kit (DK) are indexed from zero. Your computer's operating system maps each of the device's virtual serial ports to a unique, persistent serial port identifier for the device and computer. The nRF Connect for Desktop app lists the selected device's serial ports in ascending order of its virtual serial port index.

    !!! note "Note"
         Serial ports are also referred to as `COM` ports on Windows, `ttyACM` devices on Linux, and `/dev/tty` devices on macOS.

  - The default UART trace settings are 1,000,000 baud rate, with hardware flow control enabled.

## Refresh dashboard is greyed out
  - **Refresh dashboard** can be selected only after the trace is started.
  - Try to **Program device** with a provided sample application and modem firmware.

## Where to find trace files and what the `.mtrace` file extension is

Make sure that **Save trace file to disk** is enabled before starting the trace if you want them to be saved. The easiest way to find your saved files is to click **Load trace file**.

The `.mtrace` files are binary files. The `.mtrace` file extension is used to separate them from other binary files (extension `.bin`). If you want to open the file in a tool that requires a `.bin` extension, replace the `.mtrace` extension with a `.bin`. You are still able to open it in the Cellular Monitor app.

## Is it sufficient to update `prj.conf` to enable modem trace?

No, the latest UART trace backend requires changes to the device tree, as well as the configuration. It is recommended to use the new backend and snippets, see [nRF91 modem tracing with UART backend using snippets](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/app_dev/device_guides/nrf91/nrf91_snippet.html#nrf91_modem_tracing_with_uart_backend_using_snippets) in the nRF Connect SDK documentation for more information.
