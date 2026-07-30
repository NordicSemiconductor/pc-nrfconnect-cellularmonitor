# Viewing a modem trace in the Cellular Monitor app

To play back and focus on a part of the trace, you can drag and scroll the **Packet Event Viewer** in the [**Dashboard**](./overview.md#dashboard-tab) tab, which updates accordingly.

![Packet Event Viewer](./screenshots/cel_mon_pev.png "Packet Event Viewer")

You can control the viewed trace data with the following options:

- To play back the trace, click on and drag the graph to the left.
- To extend or decrease the viewed trace events, scroll the graph.
- To view information on the AT commands and the event timestamp, hover over a specific event.
- To pause a live trace, click the live button.

## Loading modem traces for playback

You can view previously collected traces in the Cellular Monitor app, including those captured in the legacy Trace Collector app.

Complete the following steps:

1. Open the Cellular Monitor app.
1. Click [**Load trace file...**](overview.md#load-trace-file) in the side panel.</br>
   The file explorer opens.
1. If the file explorer did not open at the location where you saved the trace files, browse to their location. Select and double-click the file to open it.</br>
   The Cellular Monitor app supports `.mtrace`, files from [`nrfutil trace`](https://docs.nordicsemi.com/bundle/nrfutil/page/nrfutil-trace/nrfutil-trace.html), and legacy `.bin` files.<br/>
   The app autodetects the modem firmware version from the trace file.
   You can also select the modem trace database version from the drop-down list.

The [**Dashboard**](./overview.md#dashboard-tab) tab is filled with the trace information and you can use the **Packet Event Viewer** to focus on specific parts of the trace.

![The dashboard tab filled with the trace information](./screenshots/Cell_mon_playback_result.png "The dashboard tab filled with the trace information")

## Viewing RTT modem traces

The Cellular Monitor app lets you also play back and view modem traces captured in SEGGER Real Time Transfer (RTT) logger.

!!! note "Note"
      In the current release of the Cellular Monitor app, the RTT interface is not supported for traces capture. You can only view RTT modem traces captured outside of the tool.

To view RTT modem traces in Cellular Monitor, complete the following steps:

1. Enable the RTT trace backend for your application. The exact steps are beyond the scope of the app documentation. For example, if you have an application based on the nRF Connect SDK, you can use a [dedicated snippet](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/app_dev/device_guides/nrf91/nrf91_snippet.html).
2. Ensure your device is running supported modem firmware. See [Minimum requirements and limitations](./index.md#minimum-requirements-and-limitations), and note the version for playback.
3. Use the J-Link RTT logger to collect the trace or traces and save in binary (`.bin`) format.</br>
   See [SEGGER Real Time Transfer (RTT)](https://www.segger.com/products/debug-probes/j-link/technology/about-real-time-transfer/) for more information.
4. Load and play back the trace in **Cellular Monitor**.</br>
   See [Loading modem traces for playback](./loading.md) for more information.

## Memfault and modem trace in production

In a production environment, you can configure the application to send modem traces to [Memfault](https://memfault.com/). The trace files can be downloaded from Memfault for playback and analysis in the Cellular Monitor app.

For information on nRF Connect SDK samples showing how to send modem traces to Memfault, see [Memfault configuration](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/libraries/debug/memfault_ncs.html#configuration) in the nRF Connect SDK documentation.

!!! note "Note"
     The Memfault shell is enabled by default, using the UART interface. If [AT Host](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/index.html) library and the Memfault module are enabled simultaneously, neither behave as expected, as they both require the same UART interface. You can use Modem Shell or AT Shell as an alternative to [AT Host](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/index.html).
