# Viewing RTT modem traces

Modem traces captured in J-Link Real Time Transfer (RTT) logger can be played back in the Cellular Monitor app.

!!! note "Note"
      In the current release of the Cellular Monitor app, the RTT interface is not supported for traces capture. You can only view RTT modem traces captured outside of the tool.

To view RTT modem traces captured outside of the tool in Cellular Monitor, complete the following steps:

1. Enable the RTT trace backend in your device's application using the Kconfig option [`CONFIG_NRF_MODEM_LIB_TRACE_BACKEND_RTT`](https://docs.nordicsemi.com/bundle/ncs-2.4.2/page/kconfig/index.html#CONFIG_NRF_MODEM_LIB_TRACE_BACKEND_RTT) in the `prj.conf` file.
2. Ensure your device is running supported modem firmware, see [Minimum requirements and limitations](./index.md#minimum-requirements-and-limitations), and note the version for playback.
3. Use the J-Link RTT logger to collect the trace or traces and save in binary (`.bin`) format.</br>
   See [SEGGER Real Time Transfer (RTT)](https://www.segger.com/products/debug-probes/j-link/technology/about-real-time-transfer/) for more information.
4. Load and playback the trace in **Cellular Monitor**.</br>
   See [Loading modem traces for playback](./loading.md) for more information.
