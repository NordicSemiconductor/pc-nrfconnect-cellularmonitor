# Capturing a Modem trace

Cellular Monitor generates a broad set of cellular environment data displayed in the dashboard panels. Optionally, you can also view the modem trace in Wireshark and observe application logging and the modem dialog in Serial Terminal.

See [Minimum requirements and limitations](./requirements.md) and [Preparing the device for modem trace](./preparing.md).

Complete the following steps to trace data:

1. Set the trace options in the **Cellular Monitor** side panel.

    - To store a copy of the trace for future use, enable **Save Trace file to disk**.
    - To supplement the information in the **Cellular Monitor** dashboard, choose from the following options:

        - To reset your application for trace capture, click **Reset device on start**.
        - To view the device modem dialog, application log, and depending on the application running, send custom AT commands, click **Open Serial Terminal**.
        - To view the live trace in Wireshark, click **Open in Wireshark**.

2. Click **Start** to trace.

3. Generate additional trace data.

    - Click **Refresh Dashboard** to send a set of AT commands to the device to feed the trace with information on the environment.
    - Send AT commands using the Serial Terminal and from the dashboard fields.

4. Follow the progress in the **Connection Status** panel.</br>
   On success, the stage's status indicator turns green with a checkmark.

    If a stage fails, a red X is displayed along with a reason for the failure. You can check the corresponding dashboard field for troubleshooting information.

     - If the minimum requirements for trace have been met, the **Trace** checkmark should be green. See [Minimum requirements and limitations](./requirements.md) and [Preparing the device for modem trace](./preparing.md).
     - **SIM** shows the Subscriber Identity Module (SIM) card status. For example, if you remove your SIM card from the device, the SIM turns red.
     - **Long-Term Evolution (LTE) Connection** depends on conditions in the local cellular network to which you are subscribed.
     - **Packet Data Network (PDN)** turns green when the device has successfully connected to the connection endpoint.

For more information on trace data visualization, see [Viewing a Modem trace in Cellular Monitor](./viewing.md).
