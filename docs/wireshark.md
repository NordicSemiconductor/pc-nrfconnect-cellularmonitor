# Using Wireshark

Wireshark can be used live while capturing a trace or to analyze saved trace files. The following two alternatives are available.

## Open in Wireshark

Opens and displays trace data live in **Wireshark** when the trace is started.

The option is available only when a device is selected.

## Open trace file in Wireshark...

Opens file explorer and allows you to select an `.mtrace` or `.bin` file. The selected file is converted to Packet Capture Next Generation (PcapNG) format and displayed in **Wireshark**.

Wireshark analyzes layers and protocols in the trace, in addition to AT commands. It can color and filter traffic based on packet type. See [DevAcademy article on viewing modem traces in Wireshark](https://academy.nordicsemi.com/topic/lesson-7-exercise-2/) for more information.