# Memfault and modem trace in production

In a production environment, you can configure the application to send modem traces to Memfault. The trace files can be downloaded from Memfault for playback and analysis in the Cellular Monitor app.

For information on nRF Connect SDK samples showing how to send modem traces to Memfault, see [Memfault configuration](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/libraries/debug/memfault_ncs.html#configuration) in the nRF Connect SDK documentation.

See also [Memfault](https://memfault.com/).

!!! note "Note"
     The Memfault shell is enabled by default, using the UART interface. If [AT Host](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/index.html) library and the Memfault module are enabled simultaneously, neither behave as expected, as they both require the same UART interface. You can use Modem Shell or AT Shell as an alternative to [AT Host](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/index.html).
