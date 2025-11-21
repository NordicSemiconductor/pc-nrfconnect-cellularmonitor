# Programming Nordic Thingy 91

You can program the Nordic Thingy 91 application and network core firmware over USB by using MCUboot using the Cellular Monitor app.

!!! note "Note"
     This option is only available for the nRF9160 DK and Nordic Thingy:91.

To program the firmware on the Thingy:91 using the Cellular Monitor app, complete the following steps:

1. Open the Cellular Monitor app.
1. Click **SELECT DEVICE** and select the Thingy:91 from the drop-down list.

    ![Cellular Monitor app - Select device](./screenshots/cellularmonitor_selectdevice_thingy91.png "Cellular Monitor app - Select device")

   The drop-down text changes to the type of the selected device, with its SEGGER ID below the name.

1. Click **Program device** in the **ADVANCED OPTIONS** section.

    ![Cellular Monitor app - Program device](./screenshots/cellularmonitor_programdevice_thingy91.png "Cellular Monitor app - Program device")

    The **Program sample app** window appears, displaying applications you can program to the Thingy:91.

1. Click **Select** in the **Modem Shell** section.

    ![Cellular Monitor - Select Modem Shell](./screenshots/cellularmonitor_selectmodemshell.png "Cellular Monitor - Select Modem Shell")

   The **Program Modem Firmware (Optional)** window appears.

1. Click **Select** in the section for the latest modem firmware.

   The **Program Mode Firmware (Optional)** window expands to display additional information.

    ![Cellular Monitor app - Enable MCUboot](./screenshots/cellularmonitor_enablemcuboot.png "Cellular Monitor app - Enable MCUboot")

1. Switch off the Thingy:91.
1. Press **SW3** while switching **SW1** to the **ON** position to enable MCUboot mode.
1. Click **Program** to program the modem firmware to the Thingy:91.
   Do not unplug or turn off the device during this process.

   When the process is complete, you see a success message.

   If you see an error message, switch off the Thingy:91, enable MCUboot mode again, and click **Program**.

1. Click **Continue** to move to the next step.

   The **Program Mode Firmware (Optional)** window changes to the **Program Modem Shell** window.

1. Switch off the Thingy:91.
1. Press **SW3** while switching **SW1** to the **ON** position to enable MCUboot mode.
1. Click **Program** to program the application to the Thingy:91.
   Do not unplug or turn off the device during this process.

   When the process is complete, you see a success message.
   Click **Close** to close the **Program Modem Shell** window.

   If you see an error message, switch off the Thingy:91, enable MCUboot mode again, and click **Program**.
