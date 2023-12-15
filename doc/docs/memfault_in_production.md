# Memfault and modem trace in production

In a production environment, you can configure the application to send modem traces to Memfault. The trace files can be downloaded from Memfault for playback and analysis in Cellular Monitor.

For information on nRF Connect SDK samples showing how to send modem traces to Memfault, see [NCS Memfault configuration](https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/nrf/libraries/debug/memfault_ncs.html#memfault).

See also [Memfault](https://memfault.com/).

!!! note "Note"
     The Memfault shell is enabled by default, using the UART interface. If [AT Host](https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/nrf/libraries/modem/at_host.html#lib-at-host) library and the Memfault module are enabled simultaneously, neither behave as expected, as they both require the same UART interface. You can use Modem Shell or AT Shell as an alternative to [AT Host](https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/nrf/libraries/modem/at_host.html#lib-at-host).
