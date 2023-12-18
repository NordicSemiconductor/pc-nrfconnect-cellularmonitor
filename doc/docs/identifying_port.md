# Identifying trace serial port

The number and function of the serial ports depends on the selected device and the onboard application firmware.

The virtual serial ports on a Nordic Semiconductor Development Kit (DK) are indexed from zero. Your computer's operating system maps each of the device's virtual serial ports to a unique, persistent serial port identifier for the device and computer. nRFConnect for Desktop app lists the selected device's serial ports in ascending order of its virtual serial port index.

In the following example, the virtual serial ports indexed 0, 1, and 2 on the nRF9160 DK are mapped to serial ports 9, 12, and 10 respectively on the computer. See your product's hardware user guide for more information on the device's virtual serial ports and Universal Asynchronous Receiver/Transmitter (UART) interface settings.

!!! note "Note"
      Serial ports are also referred to as `COM` ports on Windows, `ttyACM` devices on Linux, and `/dev/tty` devices on macOS.
