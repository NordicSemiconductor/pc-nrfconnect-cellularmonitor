# Overview and user interface

After starting the Cellular Monitor, the context-sensitive application window is displayed. If a supported device is selected, you can capture traces; otherwise, traces can be played back.

## Before selection

Before a device is selected, the sidebar contains the following elements:

### Select Device

Dropdown to list the devices attached to the computer. When you select a supported device, the app attempts to connect to two different serial ports. One of the ports is for communication and logging, the other is for modem trace.

### Buy development kit...

Opens a dialog with localized links to partner websites to purchase the supported devices.

### Load trace file...

Opens file explorer and allows you to select a trace file. Traces captured using **Cellular Monitor** have the file extension `.mtrace`. You can also open files from `nrfutil trace` and legacy **Trace Collector** `.bin` files.

### Open trace file in Wireshark...

Opens file explorer and allows you to select an `.mtrace` or `.bin` file. The selected file is converted to Packet Capture Next Generation (PcapNG) format and displayed in Wireshark.

## After selection

When a device is selected, **Cellular Monitor** tries to discover its capabilities. The side panel options are updated depending on the results.

### Start

Starts tracing.

### Refresh dashboard

Extensively populates the dashboard fields by sending a set of recommended AT commands to your device. This button is available only if **Cellular Monitor** has identified either Modem Shell or [AT Host](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/index.html) on the device, and if you are tracing.

### Open Serial Terminal

Opens the Serial Terminal application in a new window. You can view the modem dialog and logging information from your application and the RTOS here. See [nRF Connect for Desktop Serial Terminal User Guide](lhttps://docs.nordicsemi.com/bundle/nrf-connect-serial-terminal/page/index.html) for more information on the application.

### Connection Status

Displays the trace status. If you have enabled Modem Shell or [AT Host](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/index.html) and click **Refresh Dashboard**, the Connection Status is updated automatically. See [Capturing a Modem trace](./capturing.md) for more information.

### Trace Database

The trace database is used to decode the raw modem trace. Each modem firmware version has a separate trace database. The trace database version must match the modem firmware version of the selected device.

If [AT Host](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/index.html) is enabled, choose **Autoselect**, and **Cellular Monitor** automatically selects the trace database version. If not, select the database whose version matches your modem firmware from the dropdown list of databases.

### Serial Port Trace Capture

The serial port used to send the modem trace. It is the last port in the dropdown list if your application firmware uses default settings.

### Reset Device

Resets the device before starting a new trace.

### Open in Wireshark

Opens and displays trace data live in Wireshark when the trace is started.

### Program Device

Select and program precompiled sample applications and modem firmware to your device. The samples enable the trace and [AT Host](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/index.html) prerequisites for **Cellular Monitor**. Modem firmware supporting trace is available with all samples, and you can choose to program the modem or application firmware, or both. The modem firmware needs only to be programmed once.

### Terminal Serial Port

The serial port used to send AT commands to your device if Modem Shell or [AT Host](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/index.html) is enabled. This is the port used by Serial Terminal. It is the first port in the dropdown list if your application firmware uses default settings.

### Dashboard Tab and Packet Event Viewer

See [Viewing a Modem trace in Cellular Monitor](./viewing.md).

### Certificate Manager Tab

See [Managing modem credentials](./managing_credentials.md).

## Log

The Log panel allows you to view the most important log events, tagged with a timestamp. Each time you open the app, a new session log file is created. You can find the Log panel and its controls, below the main application Window.

- When troubleshooting, to view more detailed information than shown in the Log panel, use **Open log file** to open the current log file in a text editor.
- To clear the information currently displayed in the Log panel, use **Clear Log**. The contents of the log file are not affected.
- To hide or display the Log panel in the user interface, use **Show Log**.
- To freeze Log panel scrolling, use **Autoscroll Log**.

## About Tab

You can view application information, restore defaults, access source code, and documentation. You also can find information on the selected device, access support tools, and enable verbose logging.