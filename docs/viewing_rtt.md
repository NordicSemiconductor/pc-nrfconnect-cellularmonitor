# Viewing RTT modem traces

Modem traces captured in J-link Real Time Transfer (RTT) logger can be played back in Cellular Monitor.

In the first release of Cellular Monitor, the RTT interface is not supported for traces capture. However, RTT modem traces captured outside of the tool can be viewed in Cellular Monitor with the following procedure.

1. Enable the RTT trace backend in your device's application using the Kconfig option `CONFIG_NRF_MODEM_LIB_TRACE_BACKEND_RTT` in the `prj.conf` file.
2. Ensure your device is running supported modem firmware, see [Minimum requirements and limitations](./requirements.md), and note the version for playback.
3. Use the J-link RTT logger to collect the trace or traces and save in binary (`.bin`) format.</br>
   See [SEGGER Real Time Transfer (RTT)](https://www.segger.com/products/debug-probes/j-link/technology/about-real-time-transfer/) for more information.
4. Load and playback the trace in **Cellular Monitor**.</br>
   See [Loading modem traces for playback](./loading.md) for more information.
