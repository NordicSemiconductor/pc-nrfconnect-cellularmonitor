# Troubleshooting

These troubleshooting instructions can help you fix issues you might encounter in Cellular Monitor.

Check Cellular Monitor's [Minimum requirements and limitations](./requirements.md).

## Trace data is not displayed or the file size does not increase
  - Check the trace serial port used. See [Identifying trace serial port](./identifying_port.md).
  - The default UART trace settings are 1,000,000 baud rate, with hardware flow control enabled.

## Refresh Dashboard is greyed out
  - Refresh Dashboard can be selected only after the trace is started.
  - Try to Program a provided sample application and modem firmware to your device.

## Where can I find my trace files, and what is the `.mtrace` file extension?

Make sure that **Save trace file to disk** is enabled before starting the trace if you want them to be saved. The easiest way to find your saved files is to click **Load trace file**.

Cellular Monitor `.mtrace` files are binary files, just like before. The `.mtrace` file extension is used to separate them from other binary files (extension `.bin`). If you want to open the file in a tool that requires a `.bin` extension, replace the `.mtrace` extension with a `.bin`. You are still able to open it in Cellular Monitor.

## Is it sufficient to update `prj.conf` to enable modem trace?

No, the latest UART trace backend requires changes to the device tree, as well as the configuration. It is recommended to use the new backend and snippets, see [nRF Connect SDK nRF91 modem tracing with UART backend using snippets](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/device_guides/working_with_nrf/nrf91/nrf9160.html#nrf91_modem_tracing_with_uart_backend_using_snippets) for more information.