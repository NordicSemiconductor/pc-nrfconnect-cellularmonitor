/*
# 6 SiP pin configuration

 SiP pin configuration commands can be used to configure the behavior of selected pins of the nRF91 SiP. The pins that can currently be configured are COEX0 , MAGPIO[0:2] , and MIPI RFFE.

 For more information on the nRF9160 SiP pins, see Pin assignments in nRF9160 Product Specification. The control of these pins is tied to the modem operations, i.e. the pins are only controllable when the modem is active. For example, if the modem goes to a long Power Saving Mode (PSM) sleep mode, the supply voltage for the pins is removed for power saving reasons and the pin state goes low until the modem wakes up again. The pin configuration can be made dependent on the modem’s RF frequency. This means that instead of using the cell’s static center frequency for decision-making, the dynamically changing center frequency of the current narrowband is used. Downlink or uplink direction does not affect the decision.

 Note : The commands in this chapter are intended to be given only once at boot or, alternatively, e.g. in final device production where AT+CFUN=0 must be given to store the command contents to flash memory. After giving the commands, the modem software will automatically toggle the pins, depending on RF frequency and modem state. In other words, the application does not need to send these commands during modem active usage.

##### 6.1 COEX0 pin control configuration %XCOEX0

 The Nordic-proprietary %XCOEX0 command writes the COEX0 pin configuration to device's RAM memory. v1.0.x v1.1.x v1.2.x pti_v1.1.x≥1

 The COEX0 pin can be configured to switch its state based on the modem's RF frequency, for example, to enable external Low-Noise Amplifier (LNA) in GPS mode. The behavior is similar to the %XMAGPIO command with the difference that this command only controls one pin. The AT command needs to be sent before any modem activity occurs. Based on the given configuration, the modem applies the COEX0 state corresponding to the RF frequency range automatically during runtime. The configuration is stored in NVM when the device is powered off using +CFUN=0 or AT %XFSSYNC when using PTI. The stored configuration is applied when the device is powered on. When RF is turned off, the given COEX0 state is inverted.

 6.1.1 Set command The set command writes the COEX0 pin configuration to device's RAM memory. Syntax:

 %XCOEX0=<count>,<state_0>,<freqlo_0>,<freqhi_0>,... <state_count-1><freqlo_count-1><freqhi_count-1>

 The set command parameters and their defined values are the following:

 <count> The number of frequency ranges. Valid values are 1, 2, 3, and 4.

 <state_x> The state of COEX0 with the following frequency range. Valid values are 0 and 1.


 SiP pin configuration

**<freqlo_x>**

 Low limit for the frequency range in MHz.

**<freqhi_x>**

 High limit for the frequency range in MHz.

The following command example sets COEX0 to '1' when GPS is enabled (and '0' when GPS is turned off ). COEX0 is not used with other frequencies (or LTE).

 AT%XCOEX0=1,1,1570,1580 OK

This command example sets COEX0 to '1' when GPS is enabled, or LTE frequency is 600–800 MHz or 2000– 2180 MHz

 AT%XCOEX0=3,1,1570,1580,1,2000,2180,1,600,800 OK

If the command is given without any parameters, it deletes the previously written values:

 AT%XCOEX0 OK

6.1.2 Read command

The command returns the stored pin configuration.

Response syntax:

 %XCOEX0: <count>,<state_0>,<freqlo_0>,<freqhi_0>,... <state_count-1><freqlo_count-1><freqhi_count-1>

The read response parameters and their defined values are the following:

**<count>**

 The number of frequency ranges. Valid values are 1, 2, 3, and 4.

**<state_x>**

 The state of COEX0 with the following frequency range. Valid values are 0 and 1.

**<freqlo_x>**

 Low limit for the frequency range in MHz.

**<freqhi_x>**

 High limit for the frequency range in MHz.

The following command example returns the stored configuration:

 AT%XCOEX0? AT%XCOEX0: 3,1,1570,1580,1,2000,2180,1,600,800 OK

6.1.3 Test command

The test command is not supported.


 SiP pin configuration

##### 6.2 MAGPIO configuration %XMAGPIO

The Nordic-proprietary **%XMAGPIO** command writes the MAGPIO configuration to device's RAM memory. v1.0.x v1.1.x v1.2.x pti_v1.1.x≥1

The MAGPIO pins can be used, for example, to control an external antenna tuner, or any other GPIOcontrolled device, whose state depends on modem's RF frequency. The AT command needs to be sent before any modem activity occurs. Based on the given configuration, the modem applies the MAGPIO state corresponding to the RF frequency range automatically during runtime. The configuration is stored in _NVM_ when the device is powered off with +CFUN=0 or AT%XFSSYNC when using PTI. The stored configuration is applied when the device is powered on.

6.2.1 Set command

The set command writes the MAGPIO configuration to device's RAM memory.

This command has been updated in v0.7.1 of this document. The earlier format described in v0.7 of this document is still valid, but the new format is recommended.

Syntax:

 %XMAGPIO=<gpio_0>,<gpio_1>,<gpio_2>,<num_ranges>,<state_0>,<flo_0>,<fhi_0><state_1>,<flo_1>, <fhi_1>,...

A command without any parameters deletes the previously written values.

The set command parameters and their defined values are the following:

**<gpio_x>**

 0 – MAGPIO_x is not used 1 – MAGPIO_x used

**<num_ranges>**

 The number of frequency ranges, maximum value 12

**<state_y>**

 Settings of the MAGPIO pins for the range x that follows

**<flo_y>**

 Frequency range low value when the setting is active, in MHz

**<fhi_y>**

 Frequency range high value when the setting is active, in MHz

The following table contains an example configuration for an antenna tuner:


 SiP pin configuration

 State MAGPIO2 MAGPIO1 MAGPIO0 Low MHz High MHz Unused 0 0 0 0 LTE(746–803) 1 0 0 1 746 803 LTE(698–746) 2 0 1 0 698 746 LTE(1710–2200) 2 0 1 0 1710 2200 LTE(849–894) 3 0 1 1 849 894 LTE(894–960) 4 1 0 0 894 960 Unused 5 1 0 1 LTE(803–849) 6 1 1 0 803 849 GPS 7 1 1 1 1574 1577

 Table 1: Example configuration for an antenna tuner

The following command example writes seven ranges to device's RAM:

 AT%XMAGPIO=1,1,1,7,1,746,803,2,698,746,2,1710,2200,3,849,894,4,894,960,6,803,849,7, 1574,1577 OK

This command example writes three ranges to device's RAM:

 AT%XMAGPIO=1,1,1,3,0,1574,1577,1,705,747,6,748,804 OK

The following command example deletes the previously written values:

 AT%XMAGPIO OK

6.2.2 Read command

The command returns the stored MAGPIO configuration.

Response syntax:

 %XMAGPIO: <gpio_0>,<gpio_1>,<gpio_2>,<num_ranges>,<state_0>,<flo_0>,<fhi_0><state_1>,<flo_1>, <fhi_1>,...

The read response parameters and their defined values are the following:

**<gpio_x>**

 0 – MAGPIO_x is not used 1 – MAGPIO_x used

**<num_ranges>**

 The number of frequency ranges, maximum value 12

**<state_y>**

 Settings of the MAGPIO pins for the range x that follows


 SiP pin configuration

**<flo_y>**

 Frequency range low value when the setting is active, in MHz

**<fhi_y>**

 Frequency range high value when the setting is active, in MHz

The following command example returns the stored configuration:

 AT%XMAGPIO? AT%XMAGPIO: 1,1,1,3,0,1574,1577,1,705,747,6,748,804 OK

6.2.3 Test command

The test command is not supported.

##### 6.3 SiP-external MIPI RFFE device introduction

##### %XMIPIRFFEDEV

nRF91 can be configured to control a SiP-external, _MIPI RF Front-End Control Interface (RFFE)_ -controlled^4 device to a limited extent. Antenna tuner is the primary use case. v1.0.x v1.1.x v1.2.x pti_v1.1.x≥1

The **XMIPIRFFEDEV** command introduces the device and its static parameters to nRF91. After introducing the _MIPI RFFE_ device, the configuration for the various control phases can be given using the **XMIPIRFFECTRL** command (see SiP-external MIPI RFFE device control configuration %XMIPIRFFECTRL on page 83).

The **XMIPIRFFEDEV** command needs to be sent before any modem activity occurs. The configuration is stored in _NVM_ when the device is powered off using +CFUN=0 or AT%XFSSYNC when using PTI.

The stored configuration is applied when any modem/GPS RF activity occurs.

This section and SiP-external MIPI RFFE device control configuration %XMIPIRFFECTRL on page 83 provide the generic syntax of the _MIPI RFFE_ set commands and examples of the read and delete commands. For examples using the **%XMIPIRFFEDEV** and **%XMIPIRFFECTRL** set commands, see nWP034 nRF9160 Hardware Verification Guidelines.

6.3.1 Set command

The set command writes the XMIPIRFFEDEV configuration to nRF91 RAM memory.

Syntax:

 AT%XMIPIRFFEDEV=<dev_id>,<def_usid>,<prod_id>,<man_id>,<pm_trig>

The set command parameters and their descriptions are the following:

**<dev_id>**

 Selectable identification number for the device. Non-zero. Valid range 1–255. The given dev_id is used with the %XMIPIRFFECTRL AT command. (See SiP-external MIPI RFFE device control configuration %XMIPIRFFECTRL on page 83.)

(^4) MIPI RFFESM, MIPI RF Front-End Control Interface (RFFE)


 SiP pin configuration

**<def_usid>**

 A 4-bit default Unique Slave Identifier (USID) for the MIPI RFFE device. Typically, 7 for antenna tuners (as suggested by MIPI).

**<prod_id>**

 An 8-bit PRODUCT_ID of the MIPI RFFE device. Only used if automatic reprogramming of the USID is needed. EXT_PRODUCT_ID is not supported.

**<man_id>**

 A 10-bit MANUFACTURER_ID of the MIPI RFFE device. Only used if automatic reprogramming of the USID is needed.

**<pm_trig>**

 An 8-bit content for PM_TRIG (address 0x1C = 28 dec) register. This is for setting the default power and triggering mode. Note that the setting of PM_TRIG can be also changed in the ON phase. See SiP-external MIPI RFFE device control configuration %XMIPIRFFECTRL on page 83.

All numbers should be given as decimals, i.e. not as hexadecimals. Currently, nRF91 supports only one _SiP_ external _MIPI RFFE_ -controlled device.

6.3.2 Read command

The command returns the introductory information given for a device using the **%XMIPIRFFEDEV** command and the phase-specific configurations given in the **%XMIPIRFFECTRL** command. There is no dedicated read command for **%XMIPIRFFECTRL**.

Response syntax:

 AT%XMIPIRFFEDEV? %XMIPIRFFEDEV: <dev_id>,<def_usid>,<prod_id>,<man_id>,<pm_trig> INIT: ON: OFF: PWROFF: OK

The read response parameters and their descriptions for the “%XMIPIRFFEDEV” row are as defined in Set command on page 81 if a valid **XMIPIRFFEDEV** command has been given earlier. Otherwise, the row is empty. The phase-specific rows that follow (INIT, ON, OFF, PWROFF) contain the parameters given for that phase or they are empty.

In the following command example, the following commands have been given:

 AT%XMIPIRFFEDEV=1,7,171,331,184 OK AT%XMIPIRFFECTRL= 1,1,1,28,56,6,1,2,2,3,750,3,8,850,18,9,1000,20,12,1700,35,19,1900,37, 25,2200 OK


 SiP pin configuration

In the following command example, the read command returns:

 AT%XMIPIRFFEDEV? %XMIPIRFFEDEV: 1,7,171,331,184 INIT: ON: 1,1,1,28,56,6,1,2,2,3,750,3,8,850,18,9,1000,20,12,1700,35,19,1900,37,25,2200 OFF: PWROFF: OK

6.3.3 Delete configuration

A _MIPI RFFE_ device configuration and control phase information can be deleted from the nRF91 memory using this command.

Syntax:

 AT%XMIPIRFFEDEV=<dev_id>

The following command deletes the device whose <dev_id> = 1 and all related phase controls that have been given using **AT%XMIPIRFFECTRL:**

 AT%XMIPIRFFEDEV=1 OK

 CAUTION: The combined load of Printed Circuit Board (PCB) routing, the input load of the MIPI RFFE -controlled device, and any parasitic load from application shall not exceed 15 pF at SCLK or at SDATA pins. This load translates roughly to narrow transmission line length of less than 10 cm at the application board but it is dependent on the actual PCB design. A load higher than 15 pF at SCLK or SDATA pin will increase the risk of unwanted behavior of the nRF91 SiP itself and of MIPI RFFE control.

##### 6.4 SiP-external MIPI RFFE device control configuration

##### %XMIPIRFFECTRL

After the _MIPI RFFE_ -controlled device has been introduced using **%XMIPIRFFEDEV** , its configuration in each control phase needs to be given using **XMIPIRFFECTRL**. v1.0.x v1.1.x v1.2.x pti_v1.1.x≥1

For information on **%XMIPIRFFEDEV** , see SiP-external MIPI RFFE device introduction %XMIPIRFFEDEV on page 81.

_MIPI RFFE_ devices contain an internal register map described in the datasheet of the device. To control the device, the registers in the device must be written with appropriate values. This AT command allows to configure the nRF91 SiP to write the device's registers. The register addresses, the values, and timing (phase) can be configured as described below.

The external _MIPI RFFE_ control in nRF9160 supports configuring the RFFE device for four different phases of RF operation. The phases are initializing (INIT), start receiving or transmitting (ON), stop receiving or transmitting (OFF), and going to sleep (PWROFF).

The **XMIPIRFFECTRL** command is to be sent separately for each phase. It is not mandatory to configure all phases.

The **%XMIPIRFFECTRL** command needs to be sent before any modem activity occurs. The configuration is stored in _NVM_ when the device is powered off using +CFUN=0 or AT%XFSSYNC when using PTI.


 SiP pin configuration

The phases are defined as follows:

**INIT** Applied when RF is waking up. INIT is frequency-agnostic. Controls up to four _MIPI RFFE_ device registers. The main purpose is to allow preparation or activation of the _MIPI RFFE_ device if activation requires long settling.

**ON** Applied when RF is starting for a specific frequency or when LTE M1 frequency hopping is performed by the modem RF. Controls a maximum of two frequency-agnostic registers that can be used for device activation, for instance. This phase also controls a maximum of two registers whose value can be defined to depend on the RF frequency of the modem. The table for the frequency-dependent control can have a maximum of 64 frequencies.

**OFF** Applied when RF is stopping. The configuration is frequency-agnostic. Controls up to four _MIPI RFFE_ device registers.

**PWROFF** Applied when RF is going to sleep. The configuration is frequency-agnostic. Controls up to four _MIPI RFFE_ device registers. The main purpose is to deactivate the _MIPI RFFE_ device.

For detailed examples of using the commands in different phases, see nWP034 nRF9160 Hardware Verification Guidelines.

6.4.1 Set command

The set command writes the XMIPIRFFECTRL configuration to the nRF91 RAM memory.

The command is given separately for each phase. It is not necessary to send the command for each phase, which means it is possible to configure only one phase.

Generic syntax:

 AT%XMIPIRFFECTRL=<dev_id>,<phase#>,<variable_number_of_phase_specific_parameters>

The set command parameters and their defined values are the following:

**<dev_id>**

 The identification number of the MIPI RFFE device given when it was introduced using MIPIRFFEDEV (see SiP-external MIPI RFFE device introduction %XMIPIRFFEDEV on page 81).

**<phase#>**

 Number of the phase INIT = 0, ON = 1, OFF = 2, PWR_OFF = 3. All numbers must be given as decimals (hexadecimals are not allowed).

The following figure illustrates the RFFE device control in different phases:


 SiP pin configuration

 Modem state

 RFFE device phase (#)

 Typical RFFE device control

 Triggers disabled, reset registers Set device to LowPwr

 Activate device. Write PAC/ Switch

 Set device to LowPwr

 Activate device. Write PAC/Switch

 Disable device

 OFF

 ON ON

 OFF

 OFF Sleep/ PWROFF

 Sleep/ PWROFF

 50-100 μs 50-100 μs >200 μs

 ON (1)

 INIT (0)

 ON (1) OFF (2) PWROFF (3)

 pm_trig initial config

 Set device to LowPwr

 time

 OFF (2)

 e.g. LTE RX or GPS e.g. LTE TX

 Figure 1: RFFE device control and timing in different phases

In the figure, PAC/Switch refers to a register in an example antenna tuner that controls the tunable capacitors and/or switches.

6.4.2 Phases INIT(0), OFF(2), and PWROFF(3)

Phases INIT(0), OFF(2), and PWROFF(3) are introduced here.

The syntax of each phase is the same except for the phase# parameter:

**INIT (0)**

 AT%XMIPIRFFECTRL=<dev_id>,0,<n>,<address_0>,<data_0>,...,<address_n-1>,<data_n-1>

**OFF (2)**

 AT%XMIPIRFFECTRL=<dev_id>,2,<n>,<address_0>,<data_0>,...,<address_n-1>,<data_n-1>

**PWROFF (3)**

 AT%XMIPIRFFECTRL=<dev_id>,3,<n>,<address_0>,<data_0>,...,<address_n-1>,<data_n-1>

The parameters and their defined values are the following:

**<n>**

 The number of address/data pairs. Valid values are 0, 1, 2, 3, 4. If the value is 0, all the following fields must be omitted.

**<address_x>**

 The 8-bit address of the internal register in MIPI RFFE device. x = 0, ..., n−1.

**<data_x>**

 The 8-bit data to be written to <address_x>. x = 0, ..., n−1.

For command examples, see nWP034 nRF9160 Hardware Verification Guidelines.

6.4.3 Phase ON(1)

Phase ON(1) is introduced here. It contains the most options for configuring the device.


 SiP pin configuration

Syntax:

 AT %XMIPIRFFECTRL=<dev_id>,1,<n>,<act_addr_0>,<act_data_0>,<act_addr_n-1>,<act_data_n-1>,<k>, <addr_0>,<addr_1>,<data_0_0>,<data_1_0>,<freq_0>,...,<data_0_k-1>,<data_1_k-1>,<freq_k-1>

The parameters and their descriptions are the following:

**<n>**

 The number of activation register address-data pairs. Valid values are 0, 1, 2. If n = 0, act_addr_0/1 and act_data_0/1 must be omitted.

**<act_addr_x>**

 8-bit address of the first register whose value is set to e.g. activate device. This is written each time RF starts. Must be given if <n> is greater than 0.

**<act_data_x>**

 Optional 8-bit data for the register in <act_addr_x>. Must be given if <n> is greater than 0.

**<k>**

 The number of frequencies in the configuration. Valid values are 0−64. If k = 0, all the following fields must be omitted.

**<addr_0>**

 The 8-bit address of the first register, whose value is changed on the basis of RF frequency.

**<addr_1>**

 The 8-bit address of the other register, whose value is changed on the basis of RF frequency. If addr_1 == addr_0, then only <data_0_y> is written.

**<data_0_y>**

 The 8-bit data for the register in <addr_0>, if frequency is smaller than or equal to <freq_y>.

**<data_1_y>**

 The 8-bit data for the register in <addr_1>, if frequency is smaller than or equal to <freq_y>. Note that data_1_y must be given (e.g. as 0) even if addr_1 == addr_0.

**<freq_y>**

 The frequency in MHz (integer), to which the current RF frequency is compared. If current RF frequency is smaller than or equal to <freq_y>, then <data_0_y> is written to <addr_0> and <data_1_y> is written to <addr_1>. Note that if the RF frequency is greater than <freq_k−1> (the last given frequency), then neither <addr_0> nor <addr_1> is written.

For command examples, see nWP034 nRF9160 Hardware Verification Guidelines.

6.4.4 Delete configuration

The AT%XMIPIRFFEDEV= <dev_id > command deletes all configurations for the _MIPI RFFE_ device, including phase configurations. To delete the configuration of each phase individually, set <n> = 0 or/and <k> = 0 in the phase-specific command.


 SiP pin configuration

For example, to delete only the ON phase configuration, send:

 AT%XMIPIRFFECTRL=<dev_id>,1,0,0

To delete the PWROFF phase configuration, send:

 AT%XMIPIRFFECTRL==<dev_id>,3,0

##### 6.5 Alternative configuration of SiP antenna switch

##### %XANTCFG

The Nordic-proprietary **%XANTCFG** command configures the _SiP_ -internal antenna switch to an alternative predefined position. v1.1.x≥3 v1.2.x pti_v1.1.x≥1

6.5.1 Set command

The set command configures the _SiP_ -internal antenna switch to an alternative predefined position.

The **%XANTCFG** command supports one predefined setting. Therefore, in the GPS mode the input signal to nRF9160's ANT input is routed back out from the AUX output. The configuration can be stored to device memory using AT+CFUN=0 or AT%XFSSYNC when using PTI, or given each time at boot before the modem is activated. After a valid configuration exists, nRF9160 automatically controls the switch during _Global Positioning System (GPS)_ reception. Adding further predefined settings requires a modification to MFW.

Syntax:

 %XANTCFG=<cfg>

The set command parameter and its defined values are the following:

**<cfg>**

 0 – Reserved, no action 1 – ANT input directed to AUX output in the GPS mode 2 – Reserved, no action ... 7 – Reserved, no action

The following command example directs ANT input to AUX output:

 %XANTCFG=1 OK

The following command example deletes the previous configuration:

 %XANTCFG OK

6.5.2 Read command

The command reads the currently active configuration.


 SiP pin configuration

Syntax:

 %XANTFCG?

The following command example returns the currently active configuration:

 %XANTCFG? %XANTCFG: 1 OK

6.5.3 Test command

The test command is not supported.


# 7 Packet domain commands

 Commands for the packet domain include commands that control packet-switched services.

##### 7.1 Define PDP context +CGDCONT

 The +CGDCONT command defines Packet Data Protocol (PDP) Context. v1.0.x v1.1.x v1.2.x

 For reference, see 3GPP 27.007 Ch. 10.1.1

 7.1.1 Set command The set command configures connection parameters. Syntax:

 +CGDCONT=<cid> [,<PDP_type> [,<APN> [,<PDP_addr> [,<d_comp> [,<h_comp> [,<IPv4AddrAlloc> [,<request_type> [,<P-CSCF_discovery> [,<IM_CN_Signalling_Flag_Ind> [,<NSLPI> [,<securePCO>]]]]]]]]]]]

 Note : +CGDCONT=<cid> causes the values for context number <cid> to become undefined.

 The set command parameters and their defined values are the following:

 <cid> 0–11 (mandatory). Specifies a particular Packet Data Protocol (PDP) Context definition. The parameter is local to the device and is used in other PDP contextrelated commands.

 <PDP_type> String type IP – Internet Protocol IPV6 – Internet Protocol version 6 IPV4V6 – Virtual type of dual IP stack

 <APN> String – Access Point Name (APN)

 <PDP_addr> Ignored

 <d_comp> Ignored

 <h_comp> Ignored

 <IPv4AdrAlloc> 0 – IPv4 address via Non-access Stratum (NAS) signaling (default) 1 – IPv4 address via Dynamic Host Configuration Protocol (DHCP)


 Packet domain commands

**<request type>**

 Ignored

**<P-CSCF_discovery>**

 Ignored

**<IM_CN_SignallingFlag>**

 Ignored

**<NSLPI>**

 0 – Non-access Stratum (NAS) Signalling Low Priority Indication (NSLPI) value from configuration is used (default) 1 – Value "Not configured" for NAS signaling low priority

**<securePCO>**

 0 – Protected transmission of Protocol Configuration Options (PCO) is not requested (default) 1 – Protected transmission of PCO is requested

The following command example configures CID 1 to use IPv4 and access point "IOT_apn"

 AT+CGDCONT=1,"IP","IOT_apn" OK

7.1.2 Read command

The command reads the list of defined contexts.

Response syntax:

 +CGDCONT: <cid>,<PDP_type>,<APN>,<PDP_addr>,<d_comp>,<h_comp>

The read command parameters and their defined values are the following:

**<cid>**

 0–11

**<PDP_type>**

 String type IP – Internet Protocol IPV6 – Internet Protocol version 6 IPV4V6 – Virtual type of dual IP stack

**<APN>**

 String – APN

**<PDP_addr>**

 String – IP address

**d_comp**

 0 – Compression not supported


 Packet domain commands

**h_comp**

 0 – Compression not supported

The following command example reads configured default bearers:

 AT+CGDCONT? +CGDCONT: 0,"IP","internet","10.0.1.1",0,0 +CGDCONT: 1,"IP","IOT_apn","10.0.1.2",0,0 OK

7.1.3 Test command

The test command is not supported.

##### 7.2 Packet domain event reporting +CGEREP

The **+CGEREP** command enables or disables the sending of packet domain events. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 10.1.19_.

7.2.1 Set command

The set command enables or disables the sending of packet domain events. The unsolicited result code is **+CGEV: XXX**.

For information on **+CGEV** , see Packet domain event unsolicited result codes +CGEV on page 92.

Syntax:

 +CGEREP=[<mode>]

The command parameter and its defined values are the following:

**<mode>**

 0 – Do not forward unsolicited result codes to the TE (default). 1 – Discard unsolicited result codes when the MT TE link is reserved. Otherwise, forward them directly to the TE.

The following command example subscribes CGEV notifications:

 AT+CGEREP=1 OK

7.2.2 Read command

The command reads the current mode and buffering settings.

Response syntax:

 +CGEREP: <mode>,<bfr>

The read command parameter and its defined values are the following:


 Packet domain commands

**<mode>**

 0 – Do not forward unsolicited result codes to the TE (default). 1 – Discard unsolicited result codes when the MT TE link is reserved. Otherwise, forward them directly to the TE.

**<bfr>**

 0 – MT buffer of unsolicited result codes is cleared when <mode> 1 is entered

The following command example reads the current mode:

 AT+CGEREP? +CGEREP: 1,0 OK

7.2.3 Test command

The test command reads supported modes and buffering settings.

Response syntax:

 +CGEREP: (list of supported <mode>s),(list of supported <bfr>s)

The test command parameters and their defined values are the following:

**<mode>**

 0 – Do not forward unsolicited result codes to the TE (default). 1 – Discard unsolicited result codes when the MT TE link is reserved. Otherwise, forward them directly to the TE.

**<bfr>**

 0 – MT buffer of unsolicited result codes is cleared when <mode> 1 is entered

Example:

 AT+CGEREP=? +CGEREP: (0,1),(0) OK

##### 7.3 Packet domain event unsolicited result codes +CGEV

Unsolicited packet domain notifications are sent when the device is detached from the network or when a packet data connection is activated, deactivated, or modified. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 10.1.19_.

These notifications are subscribed using the +CGEREP command.

Syntax descriptions are listed below:

Network detach:

 +CGEV: NW DETACH


 Packet domain commands

_Mobile Equipment (ME)_ detach:

 +CGEV: ME DETACH

_ME_ overheated and flight mode enabled:

 +CGEV: ME OVERHEATED

Battery voltage is low:

 +CGEV: ME BATTERY LOW

The _ME_ has activated a default bearer:

 +CGEV: ME PDN ACT <cid>[,<reason>]

The network has activated a dedicated bearer:

 +CGEV: NW ACT <p_cid>, <cid>, <event_type>

The network has deactivated a default bearer:

 +CGEV: NW PDN DEACT <cid>

The UE has deactivated a default bearer:

 +CGEV: ME PDN DEACT <cid>

The network has deactivated a dedicated bearer:

 +CGEV: NW DEACT <p_cid>, <cid>, <event_type>

The UE has deactivated a dedicated bearer:

 +CGEV: ME DEACT <p_cid>, <cid>, <event_type>

The network has modified a bearer:

 +CGEV: NW MODIFY <cid>, <change_reason>, <event_type>

The UE has modified a bearer:

 +CGEV: ME MODIFY <cid>, <change_reason>, <event_type>

IPv6 link is up for the default bearer:

 +CGEV: IPV6 <cid>

IPv6 address resolution or refresh failure:

 +CGEV: IPV6 FAIL <cid>

Requested procedure restricted: v1.1.x v1.2.x

 +CGEV: RESTR <cause>, <validity>


 Packet domain commands

**<cid>**

 0–11

**<reason>**

 0 – Only IPv4 allowed 1 – Only IPv6 allowed 2 – Only single access bearers allowed 3 – Only single access bearers allowed and context activation for a second address type bearer was not successful.

**<change_reason>**

 Integer. A bitmap that indicates what kind of change has occurred. The <change_reason> value is determined by summing all the applicable bits. Bit 1 – TFT changed Bit 2 – QoS changed Bit 3 – WLAN offload changed

**<cid_other>**

 1–11: Indicates the context identifier allocated for an MT-initiated context of a second address type. This parameter is included only if <reason> parameter indicates that only single address bearers are allowed.

**<p_cid>**

 0–11: Context identifier for an associated default context.

**<event_type>**

 0 – Informational event 1 – Information request. Acknowledgement is required, and it can be either accept or reject.

**<cause>**

 Restriction cause 1 – Radio Policy Manager (RPM). Procedure restricted by RPM. 2 – Throttling. Procedure restricted by 3GPP or operator-specific throttling. 3 – Invalid configuration. Procedure restricted by invalid context configuration.

**<validity>**

 Validity of restriction 1 – Permanent restriction. Enabling requires e.g. a power-off, UICC change, or a configuration change. 2 – Temporary restriction. Enabling requires e.g. back-off timer expiry.

The example notification shows that an initial _Packet Data Network (PDN)_ connection is activated:

 +CGEV: ME PDN ACT 0

The example notification shows that the device is detached from network:

 +CGEV: ME DETACH


 Packet domain commands

The example notification shows a restriction caused by throttling with temporary validity.

 +CGEV: RESTR 2,2

##### 7.4 PDP context activate +CGACT

The **+CGACT** command activates or deactivates a _PDN_ connection. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 10.1.10_.

7.4.1 Set command

The set command activates or deactivates a _PDN_ connection.

 Note : Initial PDN connection (cid 0) could not be activated or deactivated.

First, the _Packet Data Protocol (PDP) Context_ needs to be defined with the +CGDCONT command, see Define PDP context +CGDCONT on page 89.

Syntax:

 +CGACT=<state>,<cid>

The set command parameters and their defined values are the following:

**<state>**

 0 – Deactivate 1 – Activate

**<cid>**

 1–11

The following command example activates a bearer configured with CID 1:

 AT+CGACT=1,1 OK

7.4.2 Read command

The command reads a list of _PDN_ connections and states.

Response syntax:

 +CGACT: <cid>,<state>

The read command parameters and their defined values are the following:

**<state>**

 0 – deactivate 1 – activate

**<cid>**

 0–11


 Packet domain commands

The following command example returns a list of connections with states:

 AT+CGACT? +CGACT: 0,1 +CGACT: 1,1 OK

7.4.3 Test command

The test command returns a list of supported states.

Response syntax:

 +CGACT: (list of supported <state>s)

The test command parameters and their defined values are the following:

**<state>**

 0 – Deactivate 1 – Activate

Example:

 AT+CGACT=? +CGACT: (0,1) OK

##### 7.5 Allocate new CID %XNEWCID

The Nordic-proprietary **%XNEWCID** command allocates a new context identifier. v1.0.x v1.1.x v1.2.x

7.5.1 Set command

The set command is not supported.

7.5.2 Read command

The read command allocates a new context identifier.

The command allocates a unique context identifier, which can be referenced with other commands like **+CGDCONT**. The allocated identifier can be deallocated with the **CGDCONT** command by giving only the <cid> parameter.

This command can be used instead of reading existing default and dedicated contexts with **AT +CGDCONT?** and finding an unused <cid> value before configuring new context.

Response syntax:

 %XNEWCID: <cid>

The command parameter and its defined values are the following:

**<cid>**

 1–11


 Packet domain commands

The following command example requests the allocation of a new context identifier:

 AT%XNEWCID? %XNEWCID: 2 OK

7.5.3 Test command

The test command is not supported.

##### 7.6 Map CID to PDN ID %XGETPDNID

The Nordic-proprietary **%XGETPDNID** command maps the context identifier to _PDN_ ID. This command can be used only when the modem is activated. v1.0.x v1.1.x v1.2.x

7.6.1 Set command

The set command maps the context identifier to _PDN_ ID.

PDN ID is used on a data path to select one of the existing connections for data transfer.

Syntax:

 %XGETPDNID=<cid>

Response syntax:

 %XGETPDNID: <pdn_id>

The set command parameters and their defined values are the following:

**<cid>**

 0–11

**<pdn_id>**

 0–20

Example:

 AT%XGETPDNID=0 %XGETPDNID: 1 OK

7.6.2 Read command

The read command is not supported.

7.6.3 Test command

The test command is not supported.


 Packet domain commands

##### 7.7 QoS dynamic params +CGEQOSRDP

The **+CGEQOSRDP** command reads dynamic _Evolved Packet System (EPS) Quality of Service (QoS)_ parameters. This command issues a valid response only when the modem is activated. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 10.1.27_.

7.7.1 Set command

The set command reads dynamic _EPS QoS_ parameters.

Syntax:

 +CGEQOSRDP[=<cid>]

Response syntax:

 [+CGEQOSRDP: <cid>,<QCI>,[<DL_GBR>,<UL_GBR>],[<DL_MBR>,<UL_MBR>][,<DL_AMBR>,<UL_AMBR>]]

The set command parameters and their defined values are the following:

**<cid>**

 Context identifier, 0 – 11. If the parameter <cid> is omitted, the QoS parameters for all active Packet Data Protocol (PDP) Context s are returned.

**<QCI>**

 Integer. Specifies a class of EPS QoS (see 3GPP TS 23.203 and 3GPP TS 24.301 ).

**<DL_AMBR>**

 Integer. Specifies downlink APN aggregate maximum bitrate. Value range 0– 65280000 kbps.

**<UL_AMBR>**

 Integer. Specifies uplink APN aggregate maximum bitrate. Value range 0–65280000 kbps.

**<DL_GBR>, <UL_GBR>, <DL_MBR>, <UL_MBR>**

 Not supported

The following command example returns a list of contexts with QoS parameters:

 Get list of contexts with QOS parameters AT+CGEQOSRDP +CGEQOSRDP: 0,0,, +CGEQOSRDP: 1,2,, +CGEQOSRDP: 2,4,,,1,65280000 OK

7.7.2 Read command

The read command is not supported.

7.7.3 Test command

The test command is not supported.


 Packet domain commands

##### 7.8 Show PDP address(es) +CGPADDR

The +CGPADDR command returns a list of _Packet Data Protocol (PDP)_ addresses for the specified context identifiers. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 10.1.14_.

7.8.1 Set command

The set command returns a list of _PDP_ addresses for the specified context identifiers. This command issues a valid response only when the modem is activated.

Syntax:

 +CGPADDR[=<cid>]

If <cid> is not present, all activated contexts are listed.

Response syntax:

 [+CGPADDR: <cid>[,<PDP_addr_1>[,<PDP_addr_2>]]]

The set command parameters and their defined values are the following:

**<cid>**

 0–11

**<PDP_addr_1>**

 String. For IPv4 given as a dot-separated numeric (0–255) parameter. For IPv6 given as a colon-separated hexadecimal (0x0000–0xFFFF) parameter.

**<PDP_addr_2>**

 String. Given as a colon-separated hexadecimal (0x0000–0xFFFF) parameter. Included when both IPv4 and IPv6 addresses are assigned.

The following command example returns the IP address for context 1:

 AT+CGPADDR=1 +CGPADDR: 1,"10.0.0.130","1050:0000:0000:0000:0005:0600:300c:326b" OK

7.8.2 Read command

The read command is not supported.

7.8.3 Test command

The test command returns a list of defined <cid> values.

Response syntax:

 +CGPADDR: (list of defined <cid>s)

The test command parameter and its defined values are the following:

**<cid>**

 0–11


 Packet domain commands

Example:

 AT+CGPADDR=? +CGPADDR: (0,1) OK

##### 7.9 PDN connection dynamic parameters +CGCONTRDP

The **+CGCONTRDP** command returns information for an active _PDN_ connection. This command issues a valid response only when the modem is activated. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 10.1.23_.

7.9.1 Set command

The set command returns information for an active _PDN_ connection.

Syntax:

 +CGCONTRDP=<cid>

Response syntax:

 +CGCONTRDP: <cid>,<bearer_id>,<apn>[,<local_addr and subnet_mask>[,<gw_addr>[,<DNS_prim_addr>[,<DNS_sec_addr>[,,,,,<IPv4_MTU]]]]]

The set command parameters and their defined values are the following:

**<cid>**

 0–11 (mandatory)

**<bearer_id>**

 Integer. Not supported.

**<apn>**

 String, a logical name for the network

**<local_addr and subnet_mask>**

 String. Not supported.

**<gw_addr>**

 String. Not supported.

**<DNS_prim_addr>, <DNS_sec_addr>**

 String. DNS server IP address

**IPv4_MTU**

 IPv4 Maximum Transmission Unit (MTU) size

 Note : If the PDN connection has dual stack capabilities, at least one pair of lines with information is returned per <cid>: First one line with the IPv4 parameters followed by one line with the IPv6 parameters.


 Packet domain commands

The following command example reads dynamic parameters for an initial PDN connection:

 AT+CGCONTRDP=0 +CGCONTRDP: 0,,"internet","","","10.0.0.1","10.0.0.2",,,,,1028 OK

7.9.2 Read command

The read command is not supported.

7.9.3 Test command

The test command is not supported.

##### 7.10 PS attach or detach +CGATT

The **+CGATT** command attaches the _MT_ to or detaches the MT from the Packet Domain services. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 10.1.9_.

7.10.1 Set command

The set command attaches the _UE_ to or detaches the UE from the Packet Domain services. The command is intended for testing purposes only.

 Note : The UE performs an attach automatically when activated. In normal operation there is no need to issue the +CGATT command.

Syntax:

 +CGATT=<state>

The set command parameters and their defined values are the following:

**<state>**

 0 – Detached 1 – Attached

The following command example performs an EPS attach:

 AT+CGATT=1 OK

7.10.2 Read command

The read command reads the state.

Response syntax:

 +CGATT: <state>

The response parameters and their defined values are the following:


 Packet domain commands

**<state>**

 0 – Detached 1 – Attached

The following command example reads the state in EPS attach state:

 AT+CGATT? +CGATT: 1 OK

7.10.3 Test command

The test command returns a list of supported states.

Response syntax:

 +CGATT: (list of supported <state>s)

The test command parameters and their defined values are the following:

**<state>**

 0 – Detached 1 – Attached

Example:

 AT+CGATT=? +CGATT: (0,1) OK

##### 7.11 Power preference indication for EPS +CEPPI

The **+CEPPI** command selects the power saving preference. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 10.1.38_.

7.11.1 Set command

The set command selects if the _UE_ indicates to the network during radio connection that it prefers low power configuration.

Syntax:

 +CEPPI=<power preference>

The set command parameters and their defined values are the following:

**<power preference>**

 0 – Normal 1 – Low power consumption


 Packet domain commands

The following command example selects the power saving preference:

 AT+CEPPI=1 OK

7.11.2 Read command

The read command is not supported.

7.11.3 Test command

The test command lists the supported power preferences.

Syntax:

 +CEPPI=(list of supported <power preference>s)

The set command parameters and their defined values are the following:

**<power preference>**

 0 – Normal 1 – Low power consumption

The following command example lists the supported power saving preferences:

 AT+CEPPI=? +CEPPI: (0,1)

##### 7.12 Protocol configuration options notification %XPCO

The Nordic-proprietary **%XPCO** command subscribes _PCO_ notifications. v1.0.x v1.1.x v1.2.x

7.12.1 Set command

The set command subscribes _PCO_ notifications.

Syntax:

 %XPCO=<n>

Notification syntax:

 %XPCO: <id>,<container data>

The set command parameters and their defined values are the following:

**<n>**

 0 – Unsubscribe PCO notifications 1 – Subscribe PCO notifications

The notification parameters and their defined values are the following:

**<id>**

 PCO identifier in decimal format


 Packet domain commands

**<container data>**

 Content of the container, hexadecimal data encoded with IRA characters. An empty container data string indicates that PCO container has not been received.

The following command example subscribes E-UTRA signal quality notifications:

 AT%XPCO=1 OK

The following is an example of a PCO notification for a FF00h container:

 %XPCO: 65280,"A1B1C1D1"

7.12.2 Read command

The read command is not supported.

7.12.3 Test command

The test command is not supported.

##### 7.13 Usage of ePCO/PCO in PDN connection

##### establishment %XEPCO

The Nordic-proprietary **%XEPCO** command selects the usage of ePCO/PCO in PDN connection establishment. v1.0.x v1.1.x v1.2.x

7.13.1 Set command

The set command selects ePCO/PCO usage.

Syntax:

 %XEPCO=<epco>

The set command parameters and their defined values are the following:

**<epco>**

 0 – Use PCO 1 – Use ePCO

The following command example disables ePCO and selects PCO:

 AT%XEPCO=0 OK

7.13.2 Read command

The command reads the state of ePCO/PCO usage. v1.1.x≥3

Response syntax:

 %XEPCO=<epco>


 Packet domain commands

The following command example reads the state of ePCO/PCO usage:

 AT%XEPCO? %XEPCO: 1 OK

7.13.3 Test command

The test command is not supported.

##### 7.14 APN class access %XAPNCLASS

The Nordic-proprietary **%XAPNCLASS** command reads _APN_ class data. v1.0.x v1.1.x v1.2.x

7.14.1 Set command

The set command reads _APN_ class data.

Syntax:

 %XAPNCLASS=<oper>,<class>[,<apn>]

Read response syntax:

 %XAPNCLASS: <class>,<apn>,<addr_type>

The set command and response parameters and their defined values are the following:

**<oper>**

 0 – Read

**<class>**

 APN class

**<apn>**

 APN name string

**<addr_type>**

 String IP – Internet Protocol IPV6 – Internet Protocol version 6 IPV4V6 – Virtual type of dual IP stack

The following command example reads APN class 3:

 AT%XAPNCLASS=0,3 %XAPNCLASS: 3,"VZWAPN","IPV4V6" OK

7.14.2 Read command

The read command is not supported.


 Packet domain commands

7.14.3 Test command

The test command is not supported.

##### 7.15 External IP stack IPv6 address resolution/refresh

##### failure %XIPV6FAIL

The Nordic-proprietary **%XIPV6FAIL** indicates an external IP stack IPv6 address resolution or refresh failure. v1.0.x v1.1.x v1.2.x

7.15.1 Set command

The set command indicates the modem an external IP stack IPv6 address resolution or refresh failure.

Syntax:

 %XIPV6FAIL=<cid>,<failure_type>

The set command parameters and their defined values are the following:

**<cid>**

 Context identifier

**<failure_type>**

 0 – IPv6 address refresh failure 1 – IPv6 address resolution failure

The following command example indicates the modem an IPv6 address resolution failure in the default context identifier 0:

 AT%XIPV6FAIL=0,1 OK

7.15.2 Read command

The read command is not supported.

7.15.3 Test command

The test command is not supported.

##### 7.16 Define PDN connection authentication parameters

##### +CGAUTH

The **+CGAUTH** command specifies authentication parameters. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 10.1.31_.

7.16.1 Set command

The set command specifies authentication parameters for a _PDN_ connection specified by parameter <cid>.


 Packet domain commands

Syntax:

 +CGAUTH=<cid>[,<auth_prot>[,<userid>[,<password>]]]

The set command parameters and their defined values are the following:

**<cid>**

 0–11

**<auth_prot>**

 0 – None. Username and password are removed if they have been specified. 1 – PAP 2 – CHAP

**<userid>**

 String

**<password>**

 String

The following command example sets authentication parameters for CID=1 context:

 AT+CGAUTH=1,1,"username","password" OK

7.16.2 Read command

The read command is not supported.

7.16.3 Test command

The test command is not supported.

##### 7.17 Signaling connection status +CSCON

The **+CSCON** command controls the presentation of an unsolicited result code. v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 10.1.30_.

7.17.1 Set command

The set command controls the presentation of an unsolicited result code.

Syntax:

 +CSCON=[<n>]

The set command parameters and their defined values are the following:

**<n>**

 0 – Unsolicited indications disabled 1 – Enabled: <mode> 2 – Enabled: <mode>[,<state>] 3 – Enabled: <mode>[,<state>[,<access>]]


 Packet domain commands

Notification syntax:

 +CSCON: <mode>[,<state>[,<access]]

The response parameters and their defined values are the following:

**<mode>**

 0 – Idle 1 – Connected

**<state>**

 7 – E-UTRAN connected

**<access>**

 4 – Radio access of type E-UTRAN FDD

The following command example enables level 3 indications.

 AT+CSCON=3 OK

The following is an example of a level-3-related unsolicited indication:

 +CSCON: 1,7,4

7.17.2 Read command

The command returns the current status of unsolicited result code presentation <n>.

The parameter <mode> is returned always when <n> = 0 or when <n> = 1. The optional parameter <state> is returned when <n> = 2 and <access> when <n> = 3.

Response syntax:

 +CSCON: <n>,<mode>[,<state>[,<access]]

The read command parameters and their defined values are the following:

**<n>**

 0 – Unsolicited indications disabled 1 – Enabled: <mode> 2 – Enabled: <mode>[,<state>] 3 – Enabled: <mode>[,<state>[,<access>]]

**<mode>**

 0 – Idle 1 – Connected

**<state>**

 7 – E-UTRAN connected

**<access>**

 4 – Radio access of type E-UTRAN FDD


 Packet domain commands

When reading the current signaling connection status, the following response indicates that unsolicited indications are disabled, and the modem is an idle state:

 AT+CSCON? +CSCON: 0,0 OK

The following response indicates that unsolicited indications are enabled, the modem mode is 1, E-UTRAN is connected and the radio access type is E-UTRAN FDD:

 AT+CSCON? +CSCON: 3,1,7,4 OK

7.17.3 Test command

The test command returns a list of supported values of <n> as a compound value.

Response syntax:

 +CSCON: (list of supported <n>s)

The test command parameters and their defined values are the following:

**<n>**

 0 – Unsolicited indications disabled 1 – Enabled: <mode> 2 – Enabled: <mode>[,<state>] 3 – Enabled: <mode>[,<state>[,<access>]]

The following command example returns the supported values:

 AT+CSCON=? +CSCON: (0,1,2,3) OK

##### 7.18 Use of APN %XAPNSTATUS

The Nordic-proprietary **%XAPNSTATUS** command enables and disables the use of an _APN_. v1.2.x

7.18.1 Set command

The set command enables or disables the use of an _APN_.

Syntax:

 %XAPNSTATUS=<status>,<APN>

The set command parameters and their defined values are the following:

**<status>**

 0 – Disable APN 1 – Enable APN


 Packet domain commands

**<APN>**

 String – APN

The following command example disables the use of an Internet _APN_ :

 AT%XAPNSTATUS=0,"internet"

The following command example enables the use of an Internet _APN_ :

 AT%XAPNSTATUS=1,"internet"

7.18.2 Read command

The command reads a list of disabled _APN_ s. v1.2.x

Response syntax:

 %XAPNSTATUS: [<apn_1>[,...<apn_n>]]

The read command parameter and its defined value are the following:

**<apn_x>**

 APN string

The following command example reads a list of disabled _APN_ s:

 AT%XAPNSTATUS? %XAPNSTATUS: ”APN_1”,”APN_2” OK

7.18.3 Test command

The test command is not supported.

##### 7.19 PDN configuration %XPDNCFG

The Nordic-proprietary **%XPDNCFG** command sets and reads _PDN_ configurations. v1.2.x≥1

7.19.1 Set command

The set command sets the _PDN_ configuration.

The initial _PDN_ connection that has been activated during the Attach procedure is automatically reactivated if an always-on _PDN_ has been configured with the **%XPDNCFG** command. The reactivation is triggered if deactivation occurs unexpectedly and is not requested by the client.

Syntax:

 %XPDNCFG=<lifetime>

The set command parameters and their defined values are the following:

**<lifetime>**

 0 – Default PDN lifetime 1 – Always-on PDN. The initial PDN connection is automatically reactivated.


 Packet domain commands

The following command example sets an always-on _PDN_ for the initial _PDN_ connection:

 AT%XPDNCFG=1 OK

The following command example removes the setting of the always-on _PDN_ of the initial _PDN_ connection:

 AT%XPDNCFG=0 OK

7.19.2 Read command

The command reads the _PDN_ configuration.

Response syntax:

 %XPDNCFG?

The following command example reads the initial _PDN_ configuration when an always-on _PDN_ has been configured:

 AT%XPDNCFG? %XPDNCFG: 1 OK

7.19.3 Test command

The test command is not supported.


# 8 Network service related commands

 For reference, see 3GPP 27.007 Ch. 7.

##### 8.1 PLMN selection +COPS

 The +COPS command selects a PLMN automatically or manually, and reads and searches the current mobile network. v1.0.x v1.1.x v1.2.x

 For reference, see 3GPP 27.007 Ch. 7.3

 8.1.1 Set command The set command selects a mobile network automatically or manually. The selection is stored in the nonvolatile memory during power-off. Syntax:

 +COPS=[<mode>[,<format>[,<oper>]]]

 The set command parameters and their defined values are the following:

 <mode> 0 – Automatic network selection 1 – Manual network selection 3 – Set <format> of +COPS read command response.

 <format> 0 – Long alphanumeric <oper> format. Only for <mode> 3. 1 – Short alphanumeric <oper> format. Only for <mode> 3. 2 – Numeric <oper> format

 <oper> String. Mobile Country Code (MCC) and Mobile Network Code (MNC) values. Only numeric string formats supported.

 For manual selection, only the numeric string format is supported and <oper> is mandatory. The following command example selects the automatic network selection:

 AT+COPS=0 OK

 The following command manually selects network 24407:

 AT+COPS=1,2,"24407" OK

 8.1.2 Read command The command reads the current mobile network.


 Network service related commands

Response syntax:

 +COPS: <mode>[,<format>,<oper>,[AcT>]]

The read command parameters and their defined values are the following:

**<mode>**

 0 – Automatic network selection 1 – Manual network selection 2 – Deregistered. Only for the Read command.

**<format>**

 0 – Long alphanumeric <oper> format 1 – Short alphanumeric <oper> format 2 – Numeric <oper> format

**<oper>**

 A string consisting of the operator name in the alphanumeric format or a string of MCC and MNC values.

**<AcT>**

 7 – E-UTRAN 9 – E-UTRAN (NB-S1 mode)

The following command example reads the current selection mode and network:

 AT+COPS? +COPS: 0,2,"26201",7 OK

The following command example reads the current selection mode and network with the operator name in the alphanumeric format:

 AT+COPS? +COPS: 0,0,"RADIOLINJA",7 OK

8.1.3 Test command

The test command searches the mobile network and returns a list of operators found. If the search is interrupted, the search returns existing results and the list may be incomplete.

Response syntax:

 +COPS: [(<stat>,long alphanumeric <oper>,short alphanumeric <oper>,numeric <oper>[,<AcT>])]

**+CME ERROR codes**

 516 – Radio connection is active 521 – PLMN search interrupted, partial results

The test command parameters and their defined values are the following:


 Network service related commands

**<oper>**

 String. MCC and MNC values. Only numeric string formats supported.

**<stat>**

 0 – Unknown 1 – Available 2 – Current 3 – Forbidden

**<AcT>**

 7 – E-UTRAN 9 – E-UTRAN (NB-S1 mode)

 Note :

- The command fails if the device has an active radio connection. It returns ERROR or +CME     ERROR: 516

- The time needed to perform a network search depends on device configuration and network     conditions.

The following command example is used for a manual network search:

 AT+COPS=? +COPS: (2,"","","26201",7),(1,"","","26202",7) OK

##### 8.2 Forced PLMN search %COPS

The Nordic-proprietary **%COPS** command performs a forced _PLMN_ search. v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 7.3_

8.2.1 Set command

The set command is not supported.

8.2.2 Read command

The read command is not supported.

8.2.3 Test command

The test command searches the _PLMN_ and returns a list of operators found.

The command is similar to **+COPS** with the exception that **%COPS** test command is considered a high priority search. This means that e.g. data transfer will be suspended, pagings lost, and registration is not maintained. In other words, the search will not be delayed because of any other procedure.

Response syntax:

 %COPS: [(<stat>,long alphanumeric <oper>,short alphanumeric <oper>,numeric <oper>[,<AcT>])]

The test command parameters and their defined values are the following:


 Network service related commands

**<oper>**

 String. MCC and MNC values. Only numeric string formats supported.

**<stat>**

 0 – Unknown 1 – Available 2 – Current 3 – Forbidden

**<AcT>**

 7 – E-UTRAN 9 – E-UTRAN (NB-S1 mode)

The following command example is used for a manual network search:

 AT%COPS=? %COPS: (2,"","","26201",7),(1,"","","26202",7) OK

##### 8.3 Power saving mode setting +CPSMS

The **+CPSMS** command controls _PSM_ settings. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 7.38_.

8.3.1 Set command

The command sets the power saving mode. Sets activity timer and _PSM_ period after _NAS_ signaling connection release. Configured values are stored in _NVM_ when the device is powered off with +CFUN=0.

Syntax:

 +CPSMS=[<mode>[,<Requested_Periodic-RAU>,<Requested_GPRS-READY-timer> ,<Requested_Periodic-TAU>[,<Requested_Active-Time>]]]

The command can be given as **+CPSMS=** (with all parameters omitted). In this form, the parameter <mode> is set to 0, the use of PSM is disabled, and data for all parameters is set to the manufacturerspecific default values.

The set command parameters and their defined values are the following:

**<mode>**

 0 – Disable power saving mode 1 – Enable power saving mode

**<Requested_Periodic-RAU>**

 Ignored

**<Requested_GPRS-READY-timer>**

 Ignored


 Network service related commands

**<Requested_Periodic-TAU>**

 String. One byte in 8-bit format.

 Optional. Timer value updated if present. If not present, the value of the requested Periodic-TAU is set to the manufacturer-specific default. For the coding and value range, see the GPRS Timer 3 IE in 3GPP TS 24.008 Table 10.5.163a/3GPP TS 24.008. Bits 5 to 1 represent the binary coded timer value. Bits 8 to 6 define the timer value unit for the General Packet Radio Services (GPRS) timer as follows: Bits

 8 7 6 0 0 0 – value is incremented in multiples of 10 minutes 0 0 1 – value is incremented in multiples of 1 hour

 0 1 0 – value is incremented in multiples of 10 hours 0 1 1 – value is incremented in multiples of 2 seconds 1 0 0 – value is incremented in multiples of 30 seconds

 1 0 1 – value is incremented in multiples of 1 minute 1 1 0 – value is incremented in multiples of 320 hours

 Note : Interpreted as 1 hour if the request sent to network is not integrity protected. After registration, check the value given by the network (see Network registration status +CEREG on page 131). If 1 hour unit is given, disable and enable PSM using commands +CPSMS=0 and +CPSMS=1.

 1 1 1 – value indicates that the timer is deactivated

 Note : If the USIM profile in use is a Verizon one, the minimum value for <Requested_Periodic-TAU> is 190 minutes.

**<Requested_Active-Time>**

 String. One byte in 8-bit format. Optional. Timer value updated if present. If not present, the value of the requested Active-Time is set to the manufacturer-specific default. For the coding and value range, see the GPRS Timer 2 IE in 3GPP TS 24.008 Table 10.5.163/3GPP TS 24.008.

 Bits 5 to 1 represent the binary coded timer value. Bits 8 to 6 define the timer value unit for the GPRS timer as follows: Bits 8 7 6

 0 0 0 – value is incremented in multiples of 2 seconds 0 0 1 – value is incremented in multiples of 1 minute 0 1 0 – value is incremented in multiples of 6 minutes

 1 1 1 – value indicates that the timer is deactivated


 Network service related commands

The following command example enables power saving mode and set timer values. Set Periodic-TAU timer to 10 minutes and Active-Time to 1 minute.

 AT+CPSMS=1,"","","10101010","00100001" OK

The following command example disables power saving mode:

 AT+CPSMS=0 OK

The following command example disables power saving mode and sets timer to default values:

 AT+CPSMS= OK

8.3.2 Read command

The command reads the current _PSM_ settings.

Response syntax:

 +CPSMS: <mode>,[<Requested_Periodic-RAU>],[<Requested_GPRS-READY-timer>], [<Requested_Periodic-TAU>],[<Requested_Active-Time>]

The read command parameters and their defined values are the following:

**<mode>**

 0 – Disable power saving mode 1 – Enable power saving mode

**<Requested_Periodic-RAU>**

 Ignored

**<Requested_GPRS-READY-timer>**

 Ignored


 Network service related commands

**<Requested_Periodic-TAU>**

 String. One byte in 8-bit format.

 Optional. Timer value updated if present. If not present, the value of the requested Periodic-TAU is set to the manufacturer-specific default. For the coding and value range, see the GPRS Timer 3 IE in 3GPP TS 24.008 Table 10.5.163a/3GPP TS 24.008. Bits 5 to 1 represent the binary coded timer value. Bits 8 to 6 define the timer value unit for the GPRS timer as follows: Bits

 8 7 6 0 0 0 – value is incremented in multiples of 10 minutes 0 0 1 – value is incremented in multiples of 1 hour

 0 1 0 – value is incremented in multiples of 10 hours 0 1 1 – value is incremented in multiples of 2 seconds 1 0 0 – value is incremented in multiples of 30 seconds

 1 0 1 – value is incremented in multiples of 1 minute 1 1 0 – value is incremented in multiples of 320 hours

 Note : Interpreted as 1 hour if the request sent to network is not integrity protected. After registration, check the value given by the network (see Network registration status +CEREG on page 131). If 1 hour unit is given, disable and enable PSM using commands +CPSMS=0 and +CPSMS=1.

 1 1 1 – value indicates that the timer is deactivated

 Note : If the USIM profile in use is a Verizon one, the minimum value for <Requested_Periodic-TAU> is 190 minutes.

**<Requested_Active-Time>**

 String. One byte in 8-bit format. Optional. Timer value updated if present. If not present, the value of the requested Active-Time is set to the manufacturer-specific default. For the coding and value range, see the GPRS Timer 2 IE in 3GPP TS 24.008 Table 10.5.163/3GPP TS 24.008.

 Bits 5 to 1 represent the binary coded timer value. Bits 8 to 6 define the timer value unit for the GPRS timer as follows: Bits 8 7 6

 0 0 0 – value is incremented in multiples of 2 seconds 0 0 1 – value is incremented in multiples of 1 minute 0 1 0 – value is incremented in multiples of 6 minutes

 1 1 1 – value indicates that the timer is deactivated


 Network service related commands

The following command example reads the current power saving mode settings:

 AT+CPSMS? +CPSMS: 1,,,"10101111","01101100" OK

8.3.3 Test command

The test command is not supported.

##### 8.4 eDRX setting +CEDRXS

The **+CEDRXS** command controls the setting of _eDRX_ parameters. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 7.40_.

8.4.1 Set command

The command sets the requested _eDRX_ parameters.

When a eDRX parameter is changed, the default _Paging Time Window (PTW)_ is set. If other than the default PTW has to be used, the **%XPTW** command shall be sent after the **+CEDRX** command. See PTW setting %XPTW on page 69.

Syntax:

 +CEDRXS=[<mode>,[,<AcT-type>[,<Requested_eDRX_value>]]]

Unsolicited result code syntax:

 +CEDRXP: <AcT-type>[,<Requested_eDRX_value>[,<NW-provided_eDRX_value> [,<Paging_time_window>]]]

The set command parameters and their defined values are the following:

**<mode>**

 0 − Disable the use of eDRX 1 − Enable the use of eDRX 2 − Enable the use of eDRX and enable the unsolicited result code 3 − Disable the use of eDRX and discard all parameters for eDRX or, if available, reset to the manufacturer-specific default values

**<ActT-type>**

 4 − E-UTRAN (WB-S1 mode) 5 − E-UTRAN (NB-S1 mode)

(^7) The value is applicable only in WB-S1 mode. If received in NB-S1 mode it is interpreted as if the Extended DRX parameters IE were not included in the message by this version of the protocol. (^8) The value is applicable only in WB-S1 mode. If received in NB-S1 mode it is interpreted as 0010 by this version of the protocol. (^9) The value is applicable only in NB-S1 mode. If received in WB-S1 mode it is interpreted as 1101 by this version of the protocol.


 Network service related commands

**<Requested_eDRX_value>**

 String. Half a byte in a 4-bit format. The eDRX value refers to bit 4 to 1 of octet 3 of the Extended DRX parameters information element (see 3GPP TS 24.008, subclause 10.5.5.32 ). Optional. If not present, the value of the requested eDRX period is set to the manufacturer-specific default. Bit 4 3 2 1 – E-UTRAN eDRX cycle length duration

 0 0 0 0 – 5.12 seconds^7

 0 0 0 1 – 10.24 seconds^7 0 0 1 0 – 20.48 seconds

 0 0 1 1 – 40.96 seconds

 0 1 0 0 – 61.44 seconds^8 0 1 0 1 – 81.92 seconds

 0 1 1 0 – 102.4 seconds^8

 0 1 1 1 – 122.88 seconds^8

 1 0 0 0 – 143.36 seconds^8 1 0 0 1 – 163.84 seconds

 1 0 1 0 – 327.68 seconds 1 0 1 1 – 655,36 seconds 1 1 0 0 – 1310.72 seconds 1 1 0 1 – 2621.44 seconds

 1 1 1 0 – 5242.88 seconds^9

 1 1 1 1 – 10485.76 seconds^9


 Network service related commands

**<NW-Provided_eDRX_value>**

 String. Half a byte in a 4-bit format. The eDRX value refers to bit 4 to 1 of octet 3 of the Extended DRX parameters information element (see 3GPP TS 24.008, subclause 10.5.5.32 ). Bit 4 3 2 1 – E-UTRAN eDRX cycle length duration

 0 0 0 0 – 5.12 seconds^7

 0 0 0 1 – 10.24 seconds^7 0 0 1 0 – 20.48 seconds

 0 0 1 1 – 40.96 seconds

 0 1 0 0 – 61.44 seconds^8 0 1 0 1 – 81.92 seconds

 0 1 1 0 – 102.4 seconds^8

 0 1 1 1 – 122.88 seconds^8

 1 0 0 0 – 143.36 seconds^8 1 0 0 1 – 163.84 seconds

 1 0 1 0 – 327.68 seconds 1 0 1 1 – 655,36 seconds 1 1 0 0 – 1310.72 seconds 1 1 0 1 – 2621.44 seconds

 1 1 1 0 – 5242.88 seconds^9

 1 1 1 1 – 10485.76 seconds^9


 Network service related commands

**<Paging_time_window>**

 String. Half a byte in a 4-bit format. The paging time window refers to bit 8 to 5 of octet 3 of the Extended DRX parameters information element (see 3GPP TS 24.008, subclause 10.5.5.32 ). LTE Cat M1 mode Bit 4 3 2 1 – Paging Time Window length 0 0 0 0 – 1.28 seconds

 0 0 0 1 – 2.56 seconds 0 0 1 0 – 3.84 seconds 0 0 1 1 – 5.12 seconds

 0 1 0 0 – 6.4 seconds 0 1 0 1 – 7.68 seconds 0 1 1 0 – 8.96 seconds 0 1 1 1 – 10.24 seconds

 1 0 0 0 – 11.52 seconds 1 0 0 1 – 12.8 seconds 1 0 1 0 – 14.08 seconds

 1 0 1 1 – 15.36 seconds 1 1 0 0 – 16.64 seconds 1 1 0 1 – 17.92 seconds

 1 1 1 0 – 19.20 seconds 1 1 1 1 – 20.48 seconds LTE Cat NB1 mode Bit 4 3 2 1 – Paging Time Window length 0 0 0 0 – 2.56 seconds 0 0 0 1 – 5.12 seconds

 0 0 1 0 – 7.68 seconds 0 0 1 1 – 10.24 seconds 0 1 0 0 – 12.8 seconds 0 1 0 1 – 15.36 seconds

 0 1 1 0 – 17.92 seconds 0 1 1 1 – 20.48 seconds 1 0 0 0 – 23.04 seconds

 1 0 0 1 – 25.6 seconds 1 0 1 0 – 28.16 seconds


 Network service related commands

 1 0 1 1 – 30.72 seconds 1 1 0 0 – 33.28 seconds

 1 1 0 1 – 35.84 seconds 1 1 1 0 – 38.4 seconds 1 1 1 1 – 40.96 seconds

The following command example enables eDRX and sets the requested eDRX value:

 AT+CEDRXS=1,4,"1000" OK

The unsolicited notification when <mode> 2 is used:

 +CEDRXP: 4,"1000","0101","1011" OK

8.4.2 Read command

The command is used to read the requested _eDRX_ parameters.

Response syntax:

 +CEDRXS: <AcT-type>,<Requested_eDRX_value>

The read command parameters and their defined values are the following:

**<mode>**

 0 − Disable the use of eDRX 1 − Enable the use of eDRX 2 − Enable the use of eDRX and enable the unsolicited result code 3 − Disable the use of eDRX and discard all parameters for eDRX or, if available, reset to the manufacturer-specific default values

**<ActT-type>**

 4 − E-UTRAN (WB-S1 mode) 5 − E-UTRAN (NB-S1 mode)

**<Requestd_eDRX_value>**

 String. Half a byte in a 4-bit format. The eDRX value refers to bit 4 to 1 of octet 3 of the Extended DRX parameters information element (see 3GPP TS 24.008, subclause 10.5.5.32 ).

The following command example reads the requested eDRX value:

 AT+CEDRXS? +CEDRXS: 4,"0001" OK

8.4.3 Test command

The test command is used to list the supported _eDRX_ parameters.


 Network service related commands

Response syntax:

 +CEDRXS: (list of supported <mode>s),(list of supported <AcT-type>s),(list of supported <Requested_eDRX_value>s)

The test command parameters and their defined values are the following:

**<mode>**

 0 − Disable the use of eDRX 1 − Enable the use of eDRX 2 − Enable the use of eDRX and enable the unsolicited result code 3 − Disable the use of eDRX and discard all parameters for eDRX or, if available, reset to the manufacturer-specific default values

**<ActT-type>**

 4 − E-UTRAN (WB-S1 mode) 5 − E-UTRAN (NB-S1 mode)

**<Requestd_eDRX_value>**

 String. Half a byte in a 4-bit format. The eDRX value refers to bit 4 to 1 of octet 3 of the Extended DRX parameters information element (see 3GPP TS 24.008, subclause 10.5.5.32 ).

The following command example reads the supported parameter values:

 AT+CEDRXS=? +CEDRXS: (0-3),(4-5),("0000"-"1111") OK

##### 8.5 Read EDRX dynamic parameters +CEDRXRDP

The **+CEDRXRDP** command reads dynamic eDRX parameters. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 7.41_.

8.5.1 Set command

The set command reads dynamic _eDRX_ parameters.

Syntax:

 +CEDRXRDP

Response syntax:

 +CEDRXRDP: <AcT-type>[,<Requested_eDRX_value>[,<NWprovided_eDRX_value>[,<Paging_time_window>]]]

The set command parameters and their defined values are the following:

(^10) The value is applicable only in WB-S1 mode. If received in NB-S1 mode, it is interpreted as if the Extended DRX parameters IE were not included in the message by this version of the protocol. (^11) The value is applicable only in WB-S1 mode. If received in NB-S1 mode, it is interpreted as 0010 by this version of the protocol.


 Network service related commands

**<ActT-type>**

 0 – Current cell not using eDRX 4 – E-UTRAN (WB-S1 mode) 5 – E-UTRAN (NB-S1 mode)

**<Requestd_eDRX_value>**

 String. Half a byte in a 4-bit format. The eDRX value refers to bit 4 to 1 of octet 3 of the Extended DRX parameters information element (see 3GPP TS 24.008, subclause 10.5.5.32 ).

**<NW-Provided_eDRX_value>**

 String. Half a byte in a 4-bit format. The eDRX value refers to bit 4 to 1 of octet 3 of the Extended DRX parameters information element (see 3GPP TS 24.008, subclause 10.5.5.32 ). Bit 4 3 2 1 – E-UTRAN eDRX cycle length duration

 0 0 0 0 – 5.12 seconds^10

 0 0 0 1 – 10.24 seconds^10 0 0 1 0 – 20.48 seconds

 0 0 1 1 – 40.96 seconds

 0 1 0 0 – 61.44 seconds^11 0 1 0 1 – 81.92 seconds

 0 1 1 0 – 102.4 seconds^11

 0 1 1 1 – 122.88 seconds^11

 1 0 0 0 – 143.36 seconds^11 1 0 0 1 – 163.84 seconds 1 0 1 0 – 327.68 seconds

 1 0 1 1 – 655,36 seconds 1 1 0 0 – 1310.72 seconds 1 1 0 1 – 2621.44 seconds

 1 1 1 0 – 5242.88 seconds^12

 1 1 1 1 – 10485.76 seconds^12

(^12) The value is applicable only in NB-S1 mode. If received in WB-S1 mode, it is interpreted as 1101 by this version of the protocol.


 Network service related commands

**<Paging_time_window>**

 String. Half a byte in a 4-bit format. The paging time window refers to bit 8 to 5 of octet 3 of the Extended DRX parameters information element (see 3GPP TS 24.008, subclause 10.5.5.32 ). LTE Cat M1 mode Bit 4 3 2 1 – Paging Time Window length 0 0 0 0 – 1.28 seconds

 0 0 0 1 – 2.56 seconds 0 0 1 0 – 3.84 seconds 0 0 1 1 – 5.12 seconds

 0 1 0 0 – 6.4 seconds 0 1 0 1 – 7.68 seconds 0 1 1 0 – 8.96 seconds 0 1 1 1 – 10.24 seconds

 1 0 0 0 – 11.52 seconds 1 0 0 1 – 12.8 seconds 1 0 1 0 – 14.08 seconds

 1 0 1 1 – 15.36 seconds 1 1 0 0 – 16.64 seconds 1 1 0 1 – 17.92 seconds

 1 1 1 0 – 19.20 seconds 1 1 1 1 – 20.48 seconds LTE Cat NB1 mode Bit 4 3 2 1 – Paging Time Window length 0 0 0 0 – 2.56 seconds 0 0 0 1 – 5.12 seconds

 0 0 1 0 – 7.68 seconds 0 0 1 1 – 10.24 seconds 0 1 0 0 – 12.8 seconds 0 1 0 1 – 15.36 seconds

 0 1 1 0 – 17.92 seconds 0 1 1 1 – 20.48 seconds 1 0 0 0 – 23.04 seconds

 1 0 0 1 – 25.6 seconds 1 0 1 0 – 28.16 seconds


 Network service related commands

 1 0 1 1 – 30.72 seconds 1 1 0 0 – 33.28 seconds

 1 1 0 1 – 35.84 seconds 1 1 1 0 – 38.4 seconds 1 1 1 1 – 40.96 seconds

The following command example reads eDRX parameters:

 AT+CEDRXRDP +CEDRXRDP: 4,"0011","0010","1001" OK

8.5.2 Read command

The read command is not supported.

8.5.3 Test command

The test command is not supported.

##### 8.6 Subscriber number +CNUM

The **+CNUM** command returns the subscriber _Mobile Station International Subscriber Directory Number (MSISDN)_. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 7.1_.

8.6.1 Set command

The **+CNUM** command returns the subscriber _MSISDN_.

Syntax:

 +CNUM

Response syntax:

 +CNUM: ,<number1>,<type1>

An ERROR response is returned if MSISDN is not available on _SIM_ card or if SIM card is not initialized.

The set command parameters and their defined values are the following:

**<numberx>**

 String type phone number of format specified by <typex>

**<typex>**

 Type of address octet in integer format (see 3GPP TS 24.008 subclause 10.5.4.7 )

The following command example reads the subscriber number stored in the SIM:

 AT+CNUM +CNUM: ,"+1234567891234",145 OK


 Network service related commands

8.6.2 Read command

The read command is not supported.

8.6.3 Test command

The test command is not supported.

##### 8.7 Read operator name +COPN

The **+COPN** command reads operator names. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 7.21_.

8.7.1 Set command

The set command reads operator names.

Syntax:

 +COPN

 Note : The device does not have operator names stored in it.

Example:

 AT+COPN OK

8.7.2 Read command

The read command is not supported.

8.7.3 Test command

The test command is not supported.

##### 8.8 Facility lock +CLCK

The **+CLCK** command locks, unlocks, or interrogates a facility. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 7.4_.

8.8.1 Set command

The set command locks, unlocks, or interrogates a facility.

Syntax:

 +CLCK=<fac>,<mode>[,<passwd>]


 Network service related commands

**<fac>**

 SC – SIM PN – Network personalization v1.2.x PU – Network subset personalization v1.2.x PP – Service provider personalization v1.2.x PC – Corporate personalization v1.2.x PS – USIM personalization v1.2.x

**<mode>**

 0 – Unlock 1 – Lock 2 – Query status v1.2.x

**<passwd>**

 String. Password for the facility.

 Note : SC is supported in modes 0 and 1. PN, PU, PP, PC, and PS are supported in modes 0 and 2.

The following command example disables _PIN_ query:

 AT+CLCK="SC",0,"<passwd>" OK

The following command example checks network personalization status when it is not active:

 AT+CLCK=”PN”,2 +CLCK: 0 OK

8.8.2 Read command

The read command is not supported.

8.8.3 Test command

The test command lists supported facilities.

Response syntax:

 +CLCK: (list of supported <fac>s)

Example:

 AT+CLCK=? +CLCK: ("SC","PS","PN","PU","PP","PC") OK

##### 8.9 Change password +CPWD

The **+CPWD** command changes the password for the facility lock. v1.0.x v1.1.x v1.2.x


 Network service related commands

For reference, see _3GPP 27.007 Ch. 7.5_.

8.9.1 Set command

The set command changes the password for the facility lock.

Syntax:

 +CPWD=<fac>,<oldpwd>,<newpwd>

The set command parameters and their defined values are the following:

**<fac>**

 "SC" – SIM PIN "P2" – SIM PIN2

**<oldpwd>,<newpwd>**

 String. Password.

 Note : Currently only "SC" supported.

The following command example changes the SIM _PIN_ :

 AT+CPWD="SC","1234","5678" OK

8.9.2 Read command

The read command is not supported.

8.9.3 Test command

The test command returns the supported facilities and password length.

Response syntax:

 +CPWD: list of supported (<fac>,<pwdlength>)s

The test command parameters and their defined values are the following:

**<fac>**

 "SC" – SIM PIN "P2" – SIM PIN2

**<pwdlength>**

 Integer. Maximum length of the password

Example:

 AT+CPWD=? +CPWD: ("SC",8),("P2",8) OK


 Network service related commands

##### 8.10 Network registration status +CEREG

The **+CEREG** command subscribes unsolicited network status notifications. v1.0.x v1.1.x v1.2.x

8.10.1 Set command

The set command subscribes or unsubscribes unsolicited network status notifications.

Syntax:

 +CEREG=<n>

The set command parameters and their defined values are the following:

**<n>**

 0 – Disable unsolicited result codes 1 – Enable unsolicited result codes +CEREG:<stat> 2 – Enable unsolicited result codes +CEREG:<stat>[,<tac>,<ci>,<AcT>] 3 – Enable unsolicited result codes +CEREG:<stat>[,<tac>,<ci>,<AcT>[,<cause_type>,<reject_cause>]] 4 – Enable unsolicited result codes +CEREG: <stat>[,[<tac>],[<ci>], [<AcT>][,,[,[<Active-Time>],[<Periodic-TAU>]]]] 5 – Enable unsolicited result codes +CEREG: <stat>[,[<tac>],[<ci>], [<AcT>][,[<cause_type>],[<reject_cause>][,[<ActiveTime>],[<Periodic-TAU>]]]]

For the notification syntax parameters, see Read command on page 131.

The following command example subscribes notifications with level 2:

 AT+CEREG=2 OK

Unsolicited notification level 1, trying to attach:

 +CEREG: 2

Unsolicited notification level 2, registered:

 +CEREG: 1,"002F","0012BEEF",7

8.10.2 Read command

The command reads current network registration status.

Response syntax:

+CEREG: <n>,<stat>[,[<tac>],[<ci>],[<AcT>][,<cause_type>], [<reject_cause>][,[<Active-Time>],[<Periodic-TAU>]]]]

The read command parameters and their defined values are the following:


 Network service related commands

**<n>**

 0 – Disable unsolicited result codes 1 – Enable unsolicited result codes +CEREG:<stat> 2 – Enable unsolicited result codes +CEREG:<stat>[,<tac>,<ci>,<AcT>] 3 – Enable unsolicited result codes +CEREG:<stat>[,<tac>,<ci>,<AcT>[,<cause_type>,<reject_cause>]] 4 – Enable unsolicited result codes +CEREG: <stat>[,[<tac>],[<ci>], [<AcT>][,,[,[<Active-Time>],[<Periodic-TAU>]]]] 5 – Enable unsolicited result codes +CEREG: <stat>[,[<tac>],[<ci>], [<AcT>][,[<cause_type>],[<reject_cause>][,[<ActiveTime>],[<Periodic-TAU>]]]]

**<stat>**

 0 – Not registered. UE is not currently searching for an operator to register to. 1 – Registered, home network. 2 – Not registered, but UE is currently trying to attach or searching an operator to register to. 3 – Registration denied. 4 – Unknown (e.g. out of E-UTRAN coverage). 5 – Registered, roaming. 90 – Not registered due to UICC failure.

**<tac>**

 String. A 2-byte Tracking Area Code (TAC) in hexadecimal format.

**<ci>**

 String. A 4-byte E-UTRAN cell ID in hexadecimal format.

**<AcT>**

 7 – E-UTRAN 9 – E-UTRAN NB-S1

**<cause_type>**

 0 – <reject_cause> contains an EPS Mobility Management (EMM) cause value. See 3GPP TS 24.301 Annex A.

**<reject_cause>**

 EMM cause value. See 3GPP TS 24.301 Annex A

**<Active-Time>**

 String. One byte in an 8-bit format.

 Indicates the Active Time value (T3324) allocated to the device in E-UTRAN. For the coding and value range, see the GPRS Timer 2 IE in 3GPP TS 24.008 Table 10.5.163/3GPP TS 24.008.


 Network service related commands

**<Periodic-TAU>**

 String. One byte in an 8-bit format. Indicates the extended periodic TAU value (T3412) allocated to the device in EUTRAN. For the coding and value range, see the GPRS Timer 3 IE in 3GPP TS 24.008 Table 10.5.163a/3GPP TS 24.008.

The following command example reads the current registration status:

 AT+CEREG? +CEREG: 2,1,"002F","0012BEEF",7 OK

8.10.3 Test command

The test command returns a list of supported modes as a compound value.

Response syntax:

 +CEREG: (supported modes)

The test command parameters and their defined values are the following:

**<n>**

 0 – Disable unsolicited result codes 1 – Enable unsolicited result codes +CEREG:<stat> 2 – Enable unsolicited result codes +CEREG:<stat>[,<tac>,<ci>,<AcT>] 3 – Enable unsolicited result codes +CEREG:<stat>[,<tac>,<ci>,<AcT>[,<cause_type>,<reject_cause>]] 4 – Enable unsolicited result codes +CEREG: <stat>[,[<tac>],[<ci>], [<AcT>][,,[,[<Active-Time>],[<Periodic-TAU>]]]] 5 – Enable unsolicited result codes +CEREG: <stat>[,[<tac>],[<ci>], [<AcT>][,[<cause_type>],[<reject_cause>][,[<ActiveTime>],[<Periodic-TAU>]]]]

The example shows supported unsolicited results codes:

 AT+CEREG=? +CEREG: (0-5) OK

##### 8.11 Subscribe unsolicited operator name indications

##### %XOPNAME

The Nordic proprietary **%XOPNAME** command subscribes unsolicited operator name notifications. v1.0.x v1.1.x v1.2.x

8.11.1 Set command

The set command subscribes or unsubscribes unsolicited operator name notifications. The notification is sent when _EMM_ information _Protocol Data Unit (PDU)_ with the operator name is received.


 Network service related commands

Syntax:

 %XOPNAME=<n>

Notification syntax:

 %XOPNAME: [<full_name>],[<short_name>],[<oper>]

The command and notification parameters and their defined values are the following:

**<n>**

 0 – Unsubscribe unsolicited operator names 1 – Subscribe unsolicited operator names

**<full_name>**

 A string in hexadecimal format. An optional field for the full operator name as specified in 3GPP TS 24.008 Ch. 10.5.3.5a Network Name and received from network. The first octet describes the number of spare bits in the last octet, usage of country initials, and the coding scheme of the network name. Octets 2−n specify the network name.

**<short_name>**

 A string in hexadecimal format. An optional field for a short operator name as specified in 3GPP TS 24.008 Ch. 10.5.3.5a Network Name and received from network. The first octet describes the number of spare bits in the last octet, usage of country initials, and the coding scheme of the network name. Octets 2−n specify the network name.

**<oper>**

 A string of MCC and MNC values.

The following command example subscribes notifications:

 AT%XOPNAME=1 OK

An example of an unsolicited notification for a full and a short operator name:

 %XOPNAME: "88D6B23CAD7FBB41D7B4BCCC2ECFE7","8B56FD15","556776"

An example of an unsolicited notification for a short operator name:

 %XOPNAME: ,"8B56FD15","556776"

8.11.2 Read command

The read command is not supported.

8.11.3 Test command

The test command is not supported.


 Network service related commands

##### 8.12 Subscribe unsolicited network time notifications

##### %XTIME

The Nordic proprietary **%XTIME** command subscribes unsolicited network time notifications. v1.0.x v1.1.x v1.2.x

8.12.1 Set command

The set command subscribes or unsubscribes unsolicited network time notifications. The notification is sent when _EMM_ information _PDU_ with time information is received.

Syntax:

 %XTIME=<n>

Notification syntax:

 %XTIME: [<local_time_zone>],[<universal_time>],[<daylight_saving_time>]

The set command and notification parameters and their defined values are the following:

**<n>**

 0 – Unsubscribe unsolicited network time 1 – Subscribe unsolicited network time

**<local_time_zone>**

 A string in hexadecimal format. A one-byte optional field for the local time zone as specified in 3GPP TS 24.008 Ch. 10.5.3.8 Time Zone and received from network.

**<universal_time>**

 A string in hexadecimal format. A seven-byte optional field for universal time as specified in 3GPP TS 24.008 Ch. 10.5.3.9 Time Zone and Time and received from network.

**<daylight_saving_time>**

 A string in hexadecimal format. A one-byte optional field for daylight saving time as specified in 3GPP TS 24.008 Ch. 10.5.3.12 Daylight Saving Time and received from network.

The following command example subscribes notifications:

 AT%XTIME=1 OK

An example of an unsolicited notification for network time with all parameters:

 %XTIME: "08","81109251714208","01"

An example of an unsolicited notification for network time without local time zone:

 %XTIME: ,"81109251714208","01"


 Network service related commands

8.12.2 Read command

The read command is not supported.

8.12.3 Test command

The test command is not supported.

##### 8.13 Set release assistance information %XRAI

The Nordic-proprietary **%XRAI** command sets release assistance information. v1.0.x v1.1.x v1.2.x

It is designed for cases where an application sends one packet uplink and expects one response back from the network or server. This can occur also at the end of an application session negotiation, where the application knows that it is going to send the last packet, for example an ack to a server.

8.13.1 Set command

The set command sets release assistance information.

Syntax:

 %XRAI[=<rai>]

The set command parameters and their defined values are the following:

**<rai>**

 Release assistance information sent to the network. 0 – Undefined, default 3 – Control plane one response. For more information, see 3GPP TS 24.301, subclause 9.9.4.25 Release assistance indication. 4 – Control plane no response. For more information, see 3GPP TS 24.301, subclause 9.9.4.25 Release assistance indication.

 Note :

- Release assistance information is used in control plane data. The current release supports     control plane data only in NB-IoT.

- When <rai> is set to 3 or 4, the _UE_ includes release assistance information to the next control     plane uplink data transmission until a new value is given. The network is not expecting     more uplink data and will release the radio connection. Further uplink data transfer requires     additional signaling for establishing a radio connection.

- This method does not function properly when an application or device sends multiple packets     to uplink without receiving anything in between. The **XRAI** setting does not mark a specific     packet as the last one, and the application does not know when a packet has actually been sent.

The following command example sets release assistance information when the application has one packet to be sent and no response from the network is expected:

 AT%XRAI=4 OK

This setting should be disabled only after it is clear that the data has been sent or the final receive has been done. This information could be received, for example, from **+CSCON** when the device enters LTE idle state.


 Network service related commands

8.13.2 Read command

The command reads release assistance information. v1.1.0

Response syntax:

 %XRAI: <rai>

The response parameters and their defined values are the following:

**<rai>**

 Release assistance information sent to the network. 0 – Undefined, default 3 – Control plane one response. For more information, see 3GPP TS 24.301, subclause 9.9.4.25 Release assistance indication. 4 – Control plane no response. For more information, see 3GPP TS 24.301, subclause 9.9.4.25 Release assistance indication.

The following command example reads release assistance information, the response being "Control plane no response":

 AT%XRAI? %XRAI: 4 OK

8.13.3 Test command

The test command is not supported.

##### 8.14 Operator ID %XOPERID

The Nordic-proprietary **%XOPERID** command identifies the operator _USIM_. v1.0.x v1.1.x v1.2.x

8.14.1 Set command

The set command returns the operator ID.

Syntax:

 %XOPERID

Response syntax:

 %XOPERID: <oper_id>

The response parameter and its defined values are the following:


 Network service related commands

**<oper_id>**

 0 – Operator not identified as any of those listed below. 1 – Verizon 2 – AT&T 3 – AT&T FirstNet 4 – AT&T Cricket 5 – AT&T Jasper 6 – China Telecom 7 – Softbank 8 – Telstra v1.2.x 9 – Bell v1.2.x≥1 10 – LGU v1.2.x≥1

The following command example returns the operator ID:

 AT%XOPERID %XOPERID: 1 OK

8.14.2 Read command

The read command is not supported.

8.14.3 Test command

The test command is not supported.

##### 8.15 Read modem parameters %XMONITOR

The Nordic-proprietary **%XMONITOR** command reads a set of modem parameters. v1.0.x v1.1.x v1.2.x

 Note : When NB1 system mode is used and the device is in RRC connected state, old signal quality parameter values are reported. The values are recorded and reported from the previous idle state. v1.0.x v1.1.x v1.2.x≤1

8.15.1 Set command

The set command reads modem parameters.

Response syntax: v1.0.x v1.1.x

 %XMONITOR: <reg_status>,[<full_name>,<short_name>,<plmn>,<tac>,<AcT>,<band>,<cell_id>, <phys_cell_id>,<EARFCN>,<rsrp>,<snr>,<NW-provided_eDRX_value>,<ActiveTime>,<Periodic-TAU>]

Response syntax: v1.2.x

 %XMONITOR: <reg_status>,[<full_name>,<short_name>,<plmn>,<tac>,<AcT>,<band>,<cell_id>, <phys_cell_id>,<EARFCN>,<rsrp>,<snr>,<NW-provided_eDRX_value>,<ActiveTime>,<Periodic-TAU-ext>,<Periodic-TAU>]


 Network service related commands

The response parameters and their defined values are the following:

**<reg_status>**

 0 – Not registered. UE is not currently searching for an operator to register to. 1 – Registered, home network. 2 – Not registered, but UE is currently trying to attach or searching an operator to register to. 3 – Registration denied. 4 – Unknown (e.g. out of E-UTRAN coverage). 5 – Registered, roaming. 90 – Not registered due to UICC failure.

 Note : The optional part is included in the response only when <reg_status> is 1 or 5. Some parameters may not be present in specific circumstances. For example, phys_cell_id, EARFCN, rsrp , and snr are not available when the device is not camped on a cell.

**<full_name>**

 String. Operator name in alphanumeric format.

**<short_name>**

 String. Operator name in alphanumeric format.

**<plmn>**

 String. MCC and MNC values.

**<tac>**

 String. A 2-byte TAC in hexadecimal format.

**<AcT>**

 7 – E-UTRAN 9 – E-UTRAN NB-S1

**<band>**

 Integer. Range 1−68. See 3GPP 36.101. The value is 0 when current band information is not available.

**<cell_id>**

 String. A 4-byte E-UTRAN cell ID in hexadecimal format.

**<phys_cell_id>**

 Integer. Physical cell ID.

(^13) The value is applicable only in WB-S1 mode. If received in NB-S1 mode it is interpreted as if the Extended DRX parameters IE were not included in the message by this version of the protocol. (^14) The value is applicable only in WB-S1 mode. If received in NB-S1 mode it is interpreted as 0010 by this version of the protocol. (^15) The value is applicable only in NB-S1 mode. If received in WB-S1 mode it is interpreted as 1101 by this version of the protocol.


 Network service related commands

**EARFCN**

 Integer. E-UTRA Absolute Radio Frequency Channel Number (EARFCN) for a given cell where EARFCN is as defined in 3GPP TS 36.101.

**<rsrp>**

 0 – RSRP < −140 dBm 1 – When −140 dBm ≤ RSRP < −139 dBm 2 – When −139 dBm ≤ RSRP < −138 dBm ... 95 – When −46 dBm ≤ RSRP < −45 dBm 96 – When −45 dBm ≤ RSRP < −44 dBm 97 – When −44 dBm ≤ RSRP 255 – Not known or not detectable

**<snr>**

 0 – SNR < −24 dB 1 – When −24 dB ≤ SNR < −23 dB 2 – When −23 dB ≤ SNR < −22 dB ... 47 – When 22 dB ≤ SNR < 23 dB 48 – When 23 dB ≤ SNR < 24 dB 49 – When 24 dB ≤ SNR 127 – Not known or not detectable


 Network service related commands

**<NW-provided_eDRX_value>**

 String. Half a byte in 4-bit format. The eDRX value refers to bit 4 to 1 of octet 3 of the Extended DRX parameters information element (see 3GPP TS 24.008, subclause 10.5.5.32 ).

 Bit 4 3 2 1 – E-UTRAN e-I-DRX cycle length duration

 0 0 0 0 – 5.12 seconds^13

 0 0 0 1 – 10.24 seconds^13

 0 0 1 0 – 20.48 seconds 0 0 1 1 – 40.96 seconds

 0 1 0 0 – 61.44 seconds^14 0 1 0 1 – 81.92 seconds

 0 1 1 0 – 102.4 seconds^14

 0 1 1 1 – 122.88 seconds^14

 1 0 0 0 – 143.36 seconds^14 1 0 0 1 – 163.84 seconds

 1 0 1 0 – 327.68 seconds 1 0 1 1 – 655,36 seconds 1 1 0 0 – 1310.72 seconds

 1 1 0 1 – 2621.44 seconds

 1 1 1 0 – 5242.88 seconds^15

 1 1 1 1 – 10485.76 seconds^15

**<Active-Time>**

 String. One byte in 8-bit format. Optional. Timer value updated if present. If not present, the value of the requested Active-Time is set to the manufacturer-specific default. For the coding and value range, see the GPRS Timer 2 IE in 3GPP TS 24.008 Table 10.5.163/3GPP TS 24.008.

 Bits 5 to 1 represent the binary coded timer value. Bits 8 to 6 define the timer value unit for the GPRS timer as follows: Bits

 8 7 6 0 0 0 – value is incremented in multiples of 2 seconds 0 0 1 – value is incremented in multiples of 1 minute

 0 1 0 – value is incremented in multiples of 6 minutes 1 1 1 – value indicates that the timer is deactivated


 Network service related commands

**<Periodic-TAU> v1.0.x v1.1.x**

 String. One byte in 8-bit format. Indicates the extended periodic TAU value (T3412_EXT extended value) allocated to the device in E-UTRAN. For the coding and value range, see the GPRS Timer 3 IE in 3GPP TS 24.008 Table 10.5.163a/3GPP TS 24.008. GPRS Timer 3 value (octet 3). Bits 5 to 1 represent the binary coded timer value. Bits 8 to 6 defines the timer value unit for the GPRS timer as follows: Bits 8 7 6 0 0 0 – value is incremented in multiples of 10 minutes 0 0 1 – value is incremented in multiples of 1 hour 0 1 0 – value is incremented in multiples of 10 hours 0 1 1 – value is incremented in multiples of 2 seconds 1 0 0 – value is incremented in multiples of 30 seconds 1 0 1 – value is incremented in multiples of 1 minute 1 1 0 – value is incremented in multiples of 320 hours 1 1 1 – value indicates that the timer is deactivated

**<Periodic-TAU-ext> v1.2.x**

 String. One byte in 8-bit format. Indicates the extended periodic TAU value (T3412_EXT extended value) allocated to the device in E-UTRAN. For the coding and value range, see the GPRS Timer 3 IE in 3GPP TS 24.008 Table 10.5.163a/3GPP TS 24.008. GPRS Timer 3 value (octet 3). Bits 5 to 1 represent the binary coded timer value. Bits 8 to 6 defines the timer value unit for the GPRS timer as follows: Bits 8 7 6 0 0 0 – value is incremented in multiples of 10 minutes 0 0 1 – value is incremented in multiples of 1 hour 0 1 0 – value is incremented in multiples of 10 hours 0 1 1 – value is incremented in multiples of 2 seconds 1 0 0 – value is incremented in multiples of 30 seconds 1 0 1 – value is incremented in multiples of 1 minute 1 1 0 – value is incremented in multiples of 320 hours 1 1 1 – value indicates that the timer is deactivated


 Network service related commands

**<Periodic-TAU> v1.2.x**

 String. One byte in 8-bit format.

 Optional. Timer value updated if present. If not present, the value of the requested Periodic-TAU is set to the manufacturer-specific default. For the coding and value range, see the GPRS Timer IE in 3GPP TS 24.008 Table 10.5.172/3GPP TS 24.008. Timer value (octet 2). Bits 5 to 1 represent the binary coded timer value. Bits 8 to 6 defines the timer value unit for the GPRS timer as follows: Bits 8 7 6 0 0 0 – value is incremented in multiples of 2 seconds 0 0 1 – value is incremented in multiples of 1 minute 0 1 0 – value is incremented in multiples of 6 minutes 1 1 1 – value indicates that the timer is deactivated

The following command example reads modem parameters: v1.0.x v1.1.x

 AT%XMONITOR %XMONITOR: 1,"EDAV","EDAV","26295","00B7",7,4,"00011B07",7,2300,63,39,"", "11100000","11100000" OK

The following command example reads modem parameters: v1.2.x

 AT%XMONITOR %XMONITOR: 1,"EDAV","EDAV","26295","00B7",7,4,"00011B07",7,2300,63,39,"", "11100000","11100000","00000000" OK

8.15.2 Read command

The read command is not supported.

8.15.3 Test command

The test command is not supported.

##### 8.16 Network time support %XNETTIME

The Nordic proprietary **%XNETTIME** command controls if the time received from the network is used. v1.1.x v1.2.x

8.16.1 Set command

The set command sets the requested network time support.

Network time support is enabled by default. The support setting is saved in _NVM_.


 Network service related commands

Syntax:

 %XNETTIME=<network_time_support>

The command parameter and its defined values are the following:

**<network_time_support>**

 0 – Disable network time support 1 – Enable network time support

The following command example disables network time support:

 AT%XNETTIME=0 OK

8.16.2 Read command

The command reads network time support.

Response syntax:

 %XNETTIME: <network_time_support>

The response parameter and its defined values are the following:

**<network_time_support>**

 0 – Disable network time support 1 – Enable network time support

The following command example reads network time support :

 AT%XNETTIME? %XNETTIME: 0 OK

8.16.3 Test command

The test command is not supported.

##### 8.17 Support for averaging cell search mode to detect

##### weak cells %XDEEPSEARCH

The Nordic proprietary **%XDEEPSEARCH** command supports averaging cell search mode to detect weak cells. v1.1.x v1.2.x

8.17.1 Set command

The set command sets the support for averaging cell search mode to detect weak cells.

The feature is available in NB-IoT and it will increase the probability to find weak cells. When the setting is disabled, it stops the possible ongoing deep searches immediately.

 Note : Enabling this command reduces battery lifetime.


 Network service related commands

Syntax:

 %XDEEPSEARCH=<deep_search>

The command parameter and its defined values are the following:

**<deep_search>**

 0 – Disable deep search 1 – Enable deep search

The following command example enables deep search support:

 AT%XDEEPSEARCH=1 OK

8.17.2 Read command

The command reads the status of deep search.

Response syntax:

 %XDEEPSEARCH: <deep_search>

The response parameter and its defined values are the following:

**<deep_search>**

 0 – Disable deep search 1 – Enable deep search

The following command example reads deep search availability:

 AT%XDEEPSEARCH? %XDEEPSEARCH:1 OK

8.17.3 Test command

The test command triggers averaging cell search mode to detect weak cells. The search is initiated when the next search due to unavailable network services is started.

 Note : The feature must be enabled using the set command before the test command can be succesfully performed.

Response syntax:

 %XDEEPSEARCH

The command example triggers deep search:

 AT%XDEEPSEARCH=? AT%XDEEPSEARCH OK


 Network service related commands

##### 8.18 Mobile network operator %XOPCONF

The Nordic-proprietary **%XOPCONF** command configures modem for the selected mobile network operator. v1.1.x≥3

8.18.1 Set command

The set command configures the modem to comply with the requirements of various mobile network operators. The configuration is stored in _NVM_ when the device is powered off with +CFUN=0. The stored configuration is in use when the device is powered on.

Syntax:

 %XOPCONF=<op_conf>

The command parameter and its defined values are the following:

**<op_conf>**

 1 – Automatically detected from IMSI 2 – Verizon 3 – AT&T 4 – China Telecom 5 – Softbank 6 – Telstra 7 – Bell 8 – LGU+ 9 – KDDI

The example command sets Verizon operator configuration:

 AT%XOPCONF=2 OK

8.18.2 Read command

The command reads the current mobile network operator configuration.

Response syntax:

 %XOPCONF: <op_conf>

The read command response parameters and their defined values are the following:


 Network service related commands

**<op_conf>**

 1 – Automatically detected from IMSI 2 – Verizon 3 – AT&T 4 – China Telecom 5 – Softbank 6 – Telstra 7 – Bell 8 – LGU+ 9 – KDDI

The example command reads the configured operator:

 AT%XOPCONF? AT%XOPCONF: 2 OK

8.18.3 Test command

The test command is not supported.


# 9 Mobile termination errors

 For reference, see 3GPP 27.007 Ch. 9.

##### 9.1 Report mobile termination errors +CMEE

 The +CMEE command disables or enables the use of the final result code +CME ERROR. v1.0.x v1.1.x v1.2.x

 For reference, see 3GPP 27.007 Ch. 9.1.

 9.1.1 Set command The set command disables or enables the use of the final result code +CME ERROR. Syntax:

 <+CMEE=[<n>]>

 The set command parameters and their defined values are the following:

 <n> 0 – Disable and use ERROR instead (default) 1 – Enable +CME ERROR: <err> result code and use numeric <err> values. <err> values are specified in 3GPP TS 27.007 Ch. 9.2. Vendor-specific values listed in the command chapters, the value range starts from 512.

 The following command example enables error codes in responses:

 AT+CMEE=1 OK

 9.1.2 Read command The read command returns the current setting of <n>. Response syntax:

 +CMEE: <n>

 The set command parameters and their defined values are the following:

 <n> 0 – Disabled. ERROR used as the final response in case of failure. 1 – Enabled. +CME ERROR: <err> result code and numeric <err> values used.

 The following command example reads the current error code setting:

 AT+CMEE? +CMEE: 1 OK


 Mobile termination errors

9.1.3 Test command

The test command returns supported values as a compound value.

Response syntax:

 +CMEE: (list of supported <n>s)

The set command parameters and their defined values are the following:

**<n>**

 0 – Disabled. ERROR used as the final response in case of failure. 1 – Enabled. +CME ERROR: <err> result code and numeric <err> values used.

The following command example returns the supported values:

 AT+CMEE=? +CMEE:(0,1) OK

##### 9.2 Report network error codes +CNEC

The **+CNEC** command activates or deactivates unsolicited reporting of error codes sent by the network. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 9.1B_.

9.2.1 Set command

The set command activates or deactivates unsolicited reporting of error codes sent by the network.

Syntax:

 +CNEC=[<n>]

The set command parameters and their defined values are the following:

**<n>**

 0 – Disable unsolicited error reporting 8 – Enable unsolicited result code +CNEC_EMM: <error_code>[,<cid>] to report EPS mobility management errors 16 – Enable unsolicited result code +CNEC_ESM: <error_code>[,<cid>] to report EPS session management errors 24 – Enable unsolicited result codes for +CNEM_EMM: <error_code>[,<cid>] and +CNEC_ESM: <error_code>[,<cid>]

**<error_code>**

 3GPP TS 24.301 Table 9.9.3.9.1 for EPS mobility management errors codes 3GPP TS 24.301 Table 9.9.4.4.1 for EPS session management errors codes

**<cid>**

 0 – 11. <cid> is present if <error_code> is related to a specific <cid>.


 Mobile termination errors

The following command example enables CNEC_ESM error codes.

 AT+CNEC=16 OK

The notification example shows _EMM_ Cause 22 (Congestion) received from the network:

 +CNEC_EMM: 22

9.2.2 Read command

The read command returns the current setting of <n>.

Response syntax:

 +CNEC: <n>

**<n>**

 0 – Disable 8 – +CNEC_EMM enabled 16 – +CNEC_ESM enabled 24 – +CNEC_EMM and +CNEC_ESM

The following command example reads **CNEC** error code setting, both CNEC_EMM and CNEC_ESM enabled.

 AT+CNEC? +CNEC: 24 OK

9.2.3 Test command

The test command returns the supported values as compound values.

Response syntax:

 +CNEC: (list of supported <n>s)

**<n>**

 0 – Disable 8 – +CNEC_EMM enabled 16 – +CNEC_ESM enabled 24 – +CNEM_EMM and +CNEC_ESM

The following command example returns **CNEC** error code setting values.

 AT+CNEC? +CNEC: (0,8,16,24) OK


 Mobile termination errors

##### 9.3 Extended error report +CEER

The **+CEER** command returns an extended error report. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 6.10_

9.3.1 Set command

The set command returns an extended error report.

Syntax:

 +CEER

Response syntax:

 +CEER: <report>

The command has the following parameter:

**<report>**

 String. Information related to the last failure. Contains module information and the cause value. The module is one of the following values: OTHER, ESM, EMM, PDP, UICC, SMS.

The following command example reads the latest failure stored by the modem:

 AT+CEER +CEER: "SMS 301" OK

9.3.2 Read command

The read command is not supported.

9.3.3 Test command

The test command is not supported.


# 10 SMS commands

 For reference, see 3GPP 27.005 Ch. 3.

##### 10.1 Message format +CMGF

 The +CMGF command sets message format. v1.0.x v1.1.x v1.2.x

 For reference, see 3GPP 27.005 Ch. 3.2.3.

 10.1.1 Set command The set command selects between PDU and text format

 Note : This command can only be issued by a client registered with +CNMI.

 Syntax:

 +CMGF=[<mode>]

 The set command parameter and its defined values are the following:

 <mode> 0 – PDU mode, default value

 The following command example sets the message format to PDU mode:

 AT+CMFG=0 OK

 10.1.2 Read command The read command is used to query the current message format. Response syntax:

 +CMGF: <mode>

 The read command parameter and its defined values are the following:

 <mode> 0 – PDU mode The following command example reads the current message format:

 AT+CMGF? +CMGF: 0 OK

 10.1.3 Test command The test command lists the supported message formats.


 SMS commands

Response syntax:

 +CMGF: (list of <mode>s)

The test command parameter and its defined values are the following:

**<mode>**

 0 – PDU mode

Example:

 AT+CMGF=? +CMGF: (0) OK

##### 10.2 New message indications +CNMI

The **+CNMI** command selects how new messages are indicated. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.005 Ch. 3.4.1_.

10.2.1 Set command

The command registers or unregisters an SMS client. Only one AT client can be registered as an SMS client. An existing registration must be released before registering a new client.

Syntax:

 +CNMI=[<mode>[,<mt>[,<bm>[,<ds>]]]]

The set command parameters and their defined values are the following:

**<mode>**

 0 – Do not forward unsolicited result codes to the TE (default). 3 – Forward unsolicited result codes directly to the TE.

**<mt>**

 0 – No received message notifications, the modem acts as an SMS client. Forces also <ds> to 0. 2 – SMS-DELIVERs (except class 2 and message waiting indication group) are routed directly to the TE using unsolicited result code +CMT: [<alpha>],<length><CR><LF><pdu>. TE needs to ack with +CNMA.

**<bm>**

 Ignored

**<ds>**

 0 – No SMS-STATUS-REPORTs are routed to the TE. The only option if <mt> is set to 0. 1 – SMS-STATUS-REPORTs are routed to the TE using unsolicited result code: +CDS: <length><CR><LF><pdu>. TE needs to ack with +CNMA.

The TE needs to handle both SMS-DELIVER and SMS-STATUS-REPORT or neither of them, <mt> and <ds> shall both be set to 0 at the same time, equals to <mode> 0.


 SMS commands

The following command example registers as a client for mobile-terminated SMS and status reports:

 AT+CNMI=3,2,0,1 OK

10.2.2 Read command

The command is used to query how new messages are indicated.

Response syntax:

 +CNMI: <mode>,<mt>,<bm>,<ds>,<bfr>

The set command parameters and their defined values are the following:

**<mode>**

 0 – Do not forward unsolicited result codes to the TE (default). 3 – Forward unsolicited result codes directly to the TE.

**<mt>**

 0 – No received message notifications, the modem acts as an SMS client. 2 – SMS-DELIVERs (except class 2 and message waiting indication group) are routed directly to the TE.

**<bm>**

 No CBM notifications are routed to the TE.

**<ds>**

 0 – No SMS-STATUS-REPORTs are routed to the TE. 1 – SMS-STATUS-REPORTs are routed to the TE using unsolicited result code: +CDS: <length><CR><LF><pdu>.

**<bfr>**

 1 – The buffer of unsolicited result codes is cleared when <mode> 1...3 is entered

Example:

 AT+CNMI? +CNMI: 3,2,0,1,1 OK

10.2.3 Test command

The test command is not supported.

##### 10.3 Send message, PDU mode + CMGS

The command sends a message in _PDU_ mode. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.005 Ch. 3.5.1_ and _3GPP 27.005 Ch. 4.3_.

10.3.1 Set command

The command sends a message in _PDU_ mode.


 SMS commands

 Note : Only a client registered with +CNMI is allowed to send messages.

Syntax:

 +CMGS=<length><CR><pdu><ctrl-Z>

Response syntax:

 +CMGS: <mr>[,<ackpdu>]

The set command parameters and their defined values are the following:

**<length>**

 Number of octets coded in the transport layer data unit to be given. 1–3 ASCII digits.

**<pdu>**

 Hexadecimal numbers containing two IRA characters per octet.

**<mr>**

 Message reference value.

**<ackpdu>**

 RP-User-Data element of RP-ACK PDU.

<pdu> is expected to be received in the same command after <CR>. Interactive mode is not supported. PDU consists of hexadecimal numbers containing two _IRA_ characters per octet.

The following command example sends the message "Testing a SMS messaging over LTE" to +358401234567, Service Center Address +448888888:

 AT+CMGS=42<CR>069144888888F811000C9153481032547600000B20D4F29C9E769F4161 D0BC3D07B5CBF379F89C769F416F7B590E62D3CB<ctrl-z> +CMGS: 2 OK

10.3.2 Read command

The read command is not supported.

10.3.3 Test command

The test command is not supported.

##### 10.4 Received SMS notification in PDU mode +CMT

**+CMT** notifies of an unsolicited received message in _PDU_ mode. _TE_ is expected to ack received message with **AT+CNMA**. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.005 Ch. 3.4.1_

The notification is subscribed using the **+CNMI** command.

Syntax:

 +CMT: <alpha>,<length><CR><LF><pdu>


 SMS commands

The notification parameters and their defined values are the following:

**<alpha>**

 TP-Originating-Address in string format.

**<length>**

 Number of hexadecimal octets in <pdu>. 1–3 ASCII digits.

**<pdu>**

 Hexadecimal numbers containing two IRA characters per octet.

The example returns a notification of a received message "Testing a sms messaging over lte" from +358401234567, Service Center Address +44 888 8888:

 +CMT: "+358401234567",28<CR><LF>069144888888F8D4F29C9E769F4161D0BC3D07B5CBF379F89C 769F416F7B590E62D3CB

##### 10.5 Delivery status notification in PDU mode +CDS

**+CDS** notifies of an unsolicited delivery status in _PDU_ mode. _TE_ is expected to ack received delivery report with **AT+CNMA**. v1.0.x v1.1.x v1.2.x

The notification is subscribed using the **+CNMI** command.

Syntax:

 +CDS: <length><CR><LF><pdu>

The notification parameters and their defined values are the following:

**<length>**

 Number of hexadecimal octets in <pdu>. 1–3 ASCII digits.

**<pdu>**

 Hexadecimal numbers containing two IRA characters per octet.

The example returns a delivery status notification with the recipient address, service center timestamp, and message delivery time:

 +CDS: 25<CR><LF>060C91534810325476171160316255001711603152120000 OK

##### 10.6 New message ACK, PDU mode +CNMA

The **+CNMA** command sends an ACK in _PDU_ mode. v1.0.x v1.1.x v1.2.x

 Note : Text mode is not supported.

For reference, see _3GPP 27.005 Ch. 4.7_.


 SMS commands

10.6.1 Set command

The set command sends a new message or delivery status ACK. A client receiving unsolicited notifications for new messages and delivery status is mandated to acknowledge those. This command can be used only when the modem is activated.

 Note :

- This command can only be issued by a client registered with **+CNMI**.

- After sending cause 22, the **%XSMMA** command needs to be used when memory is available.

.

If the _UE_ does not get an acknowledgement within the required time (network timeout), the it should respond as specified in _3GPP TS 24.011_ , and UE/ _TA_ shall automatically disable routing to the _TE_ by setting both <mt> and <ds> values of **+CNMI** to zero, that is, the SMS client gets unregistered.

Syntax:

 +CNMA[=<n>[,<length>[<CR>PDU is given<ctrl-Z/ESC>]]]

The set command parameters and their defined values are the following:

**<n>**

 0 – The command operates in the same way as defined for the text mode, see New message ACK, text mode +CNMA on page 158 1 – Send RP-ACK 2 – Send RP-ERROR

**<length>**

 Number of hexadecimal octets in <pdu>. 1–3 ASCII digits.

**<pdu>**

 Hexadecimal numbers containing two IRA characters per octet.

The following command example confirms the reception of a message, timestamp 06/11/2071 13:26:31:

 AT+CNMA=1,9<CR>010017116031621300<ctrl-z> OK

10.6.2 Read command

The read command is not supported.

10.6.3 Test command

The test command lists supported <n>s.

Response syntax:

 +CNMA: (list of supported <n>s)


 SMS commands

**<n>**

 0 – The command operates in the same way as defined for the text mode. 1 – Send RP-ACK. 2 – Send RP-ERROR.

Example:

 AT+CNMA=? +CNMA: (0-2) OK

##### 10.7 New message ACK, text mode +CNMA

The **+CNMA** command sends a new message ACK in text mode. v1.0.x v1.1.x v1.2.x

 Note : Text mode is not supported.

For reference, see _3GPP 27.005 Ch. 3.4.4_.

10.7.1 Set command

The set command sends a new message ACK in text mode. This command can be used only when the modem is activated.

This command can only be issued by a client registered with **+CNMI**.

If the _UE_ does not get an acknowledgement within the required time (network timeout), it should respond as specified in _3GPP TS 24.011_ and the UE/ _TA_ shall automatically disable routing to _TE_ by setting both <mt> and <ds> values of **+CNMI** to zero, i.e. the SMS client gets unregistered.

Syntax:

 +CNMA

Example:

 AT+CNMA OK

10.7.2 Read command

The read command is not supported.

10.7.3 Test command

The test command lists supported <n>s.

Response syntax:

 +CNMA: (list of supported <n>s)


 SMS commands

**<n>**

 0 – The command operates in the same way as defined for the text mode. 1 – Send RP-ACK 2 – Send RP-ERROR

Example:

 AT+CNMA=? +CNMA: (0-2) OK

##### 10.8 Preferred message storage +CPMS

The **+CPMS** command selects the memory storage. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.005 Ch. 3.2.2_.

10.8.1 Set command

The command sets the used memory.

 Note : The modem does not support SMS memory, only direct routing to TE.

Syntax:

 +CPMS=<mem1>[,<mem2>[,<mem3>]]

Response syntax:

 +CPMS: <used1>,<total1>,<used2>,<total2>,<used3>,<total3>

The set command parameters and their defined values are the following:

**<mem1>**

 "MT" – Refers to all message storage areas associated with the modem

**<mem2>**

 "MT" – Refers to all message storage areas associated with the modem

**<mem3>**

 "MT" – Refers to all message storage areas associated with the modem

**<usedx>**

 Integer. The number of messages currently in <memx>

**<totalx>**

 Integer. The number of messages currently in <memx>

Example:

 AT+CPMS="MT","MT","MT" +CPMS: 0,0,0,0,0,0 OK


 SMS commands

10.8.2 Read command

The command is used to query memory status.

Response syntax:

 +CPMS: <mem1>,<used1>,<total1>,<mem2>,<used2>,<total2>,<mem3>,<used3>,<total3>

The set command parameters and their defined values are the following:

**<mem1>**

 "MT" – Refers to all message storage areas associated with the modem

**<mem2>**

 "MT" – Refers to all message storage areas associated with the modem

**<mem3>**

 "MT" – Refers to all message storage areas associated with the modem

**<usedx>**

 Integer. The number of messages currently in <memx>

**<totalx>**

 Integer. The number of messages currently in <memx>

Example:

 AT+CPMS? +CPMS: "MT",0,0,"MT",0,0,"MT",0,0 OK

10.8.3 Test command

The test command lists supported memories.

Response syntax:

 +CPMS: (list of supported <mem1>s),(list of supported <mem2>s),(list of supported <mem3>s)

The set command parameters and their defined values are the following:

**<mem1>**

 "MT" – Refers to all message storage areas associated with the modem

**<mem2>**

 "MT" – Refers to all message storage areas associated with the modem

**<mem3>**

 "MT" – Refers to all message storage areas associated with the modem

Example:

 AT+CPMS=? +CPMS: ("MT"),("MT"),("MT") OK


 SMS commands

##### 10.9 Message service failure result code +CMS ERROR

Message service failure result code **+CMS** is sent as error response to SMS-related commands. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.005 Ch. 3.2.5_.

Response syntax:

 +CMS ERROR: <err>

The parameter and the values used by common messaging commands are the following:

**<err>**

 0...127 – 3GPP TS 24.011 clause E.2 values 128...255 – 3GPP TS 23.040 clause 9.2.3.22 values 300...511 – 3GPP TS 27.005 Ch. 3.2.5 512... – Manufacturer specific 513 – Manufacturer-specific cause: Not found 514 – Manufacturer-specific cause: Not allowed 515 – Manufacturer-specific cause: Memory full

##### 10.10 Select SMS service +CGSMS

The **+CGSMS** command selects the SMS service. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 10.1.21_.

10.10.1 Set command

The set command selects the SMS service.

Syntax:

 +CGSMS=[<service>]

The set command parameter and its defined value is the following:

**<service>**

 1 – Circuit-switched

 Note : In a failure case, the command response is ERROR or +CME ERROR.

The following command example selects the circuit-switched SMS service:

 AT+CGSMS=1 OK

10.10.2 Read command

The command reads the current SMS service.


 SMS commands

Response syntax:

 +CGSMS: <service>

The read command parameter and its defined value is the following:

**<service>**

 1 – Circuit-switched

The following command example reads the current SMS service:

 AT+CGSMS? +CGSMS: 1 OK

10.10.3 Test command

The command lists the supported SMS services.

Response syntax:

 +CGSMS: (list of currently available <service>s)

The test command parameter and its defined value is the following:

**<service>**

 1 – Circuit-switched

The following command example lists the supported SMS services:

 AT+CGSMS=? +CGSMS: (1) OK

##### 10.11 Short message memory available %XSMMA

The Nordic-proprietary **%XSMMA** command sends an _RP-SMMA_ message. v1.0.x v1.1.x v1.2.x

10.11.1 Set command

The set command sends an _RP-SMMA_ message.

The command is a trigger for the RP-SMMA message on the SMS stack to indicate to the Service Center that the _UE_ has memory available and can receive mobile-terminated short messages. The client can set a memory full situation preventing incoming SMS messages by acking a mobile-terminated short message with AT+CNMA=2 (the _PDU_ parameter has to contain cause code 22 "Memory capacity exceeded"). Cause 300 is returned for all failures.

Command syntax

 %XSMMA

The following command example triggers sending the RP-SMMA on the SMS layer to release a memory full situation and to receive a response:


 SMS commands

A successful case:

 AT%XSMMA OK

10.11.2 Read command

The read command is not supported.

10.11.3 Test command

The test command is not supported.


# 11 Production test features

 Production test AT commands can be used to test and verify products in device manufacturing. The PTI modem firmware supports a subset of AT commands for test purposes in non-signaling mode.

 The production test AT commands are supported only by PTI modem firmware versions. The PTI modem firmware supports also generic AT commands which are marked with the version tag pti_vx.x.x.

##### 11.1 Antenna detection test %XANTDETMAGPIO

 The Nordic-proprietary %XANTDETMAGPIO command reads the MAGPIO pin status to detect if the antenna is connected. The antenna is detected when the pin is DC-grounded. v1.1.x v1.2.x pti_v1.1.x≥1 This command can be used, for example, in device production testing provided that the necessary circuitry between an MAGPIO pin and the antenna is in place. See Antenna presence test using MAGPIO in nWP033

- nRF9160 Antenna and RF Interface Guidelines.

 11.1.1 Set command The set command is not supported.

 11.1.2 Read command The read command is not supported.

 11.1.3 Test command The test command changes the pin specified in the command to input mode and sets internal pull-up for the corresponding pin. After this, the pin state is read and reported in the command response. Syntax:

 AT%XANTDETMAGPIO=<magpio_pin>

 The test command parameters and their defined values are the following:

 <magpio_pin> 0, 1, 2 The MAGPIO pin whose state is read. The response values are the following:

 1 – Antenna connected 0 – Antenna not connected After the command, the pin state is set back to normal (high-Z).

 The following command example sets MAGPIO pin 2 to input mode and sets internal pull-up for it. After this, the pin state is read and reported in the command response. After the command, the pin state is set back to normal (high impedance state):

 AT%XANTDETMAGPIO=2 %XANTDETMAGPIO: 0 OK


 Production test features

##### 11.2 RF test execution %XRFTEST

The Nordic-proprietary **%XRFTEST** command performs RF testing. v1.0.x v1.1.x v1.2.x pti_v1.1.x≥1

 Note : The use of this command can be permanently prevented with the AT%XPRODDONE command.

11.2.1 Set command

The set command performs RF testing.

Syntax:

 %XRFTEST=<test>,<operation>,<param0>,<param1>,...,<param10>

The set command parameters and their defined values are the following:

**<test>**

 0 – RX 1 – TX 2 – GPS SNR 3 – RX SNR 4 – AFC v1.2.x pti_v1.1.x≥1 10 – RF sensors v1.2.x pti_v1.1.x≥1

**<operation>**

 0 – OFF 1 – ON 3 – SET v1.2.x

**<paramX>**

 One or more int16 values. The usage and number of parameters depends on <test> and <operation>. See the following sections.

11.2.1.1 RX testing

The command enables RF receiver with the given parameters. It also measures signal power at the _SiP_ antenna port with a time domain power meter and returns the measurement result.

The command parameter and its value are the following:

**<test>**

 0 – RX

**RX ON**

**<operation>**

 1 – ON

RX ON has a total of four parameters:

**<param0>**

 3GPP band number. Use 24 for GPS reception.


 Production test features

**<param1>**

 Frequency 100 kHz.

 Valid range 6000–22000 (corresponds to 600.0 MHz–2200.0 MHz). Note that if Carrier Wave (CW) is used, an offset of about 45 kHz for NB1 and 300 kHz for M1 is recommended.

**<param2>**

 RX signal power at the SiP antenna port in dBm. Valid range from −127 to −25.

**<param3>**

 System mode. Valid range 0–1. NB1 (0) or M1 (1).

Response syntax when <operation> is ON:

 %XRFTEST: <antenna_power>

The response value is the following:

**<antenna_power>**

 Measured power at the SiP antenna port in q8 dBm. q8 means that dividing the result by 2^8 = 256 gives dBm.

The following command example enables the RF receiver for Band 1, 2140.0 MHz, −65 dBm, NB1 mode:

 %XRFTEST=0,1,1,21400,-65,0 %XRFTEST: -17002 OK

 Note : −17002/256 = −66.4 dBm

**RX OFF**

**<operation>**

 0 – OFF

The following command example disables the RF receiver:

 %XRFTEST=0,0 OK

 Note : Always send the OFF command before sending another ON command.

11.2.1.2 TX testing

The command enables RF transmitter with the given parameters. It also measures TX power with an internal measurement receiver in time domain and returns the measurement result. When using TX burst mode, see TX burst mode on page 170.


 Production test features

 CAUTION: This command transmits power to the selected RF band and may violate the radio directives of the region or country. Make sure that the equipment is in an RF-shielded room or connected to an RF cable so that RF power will not leak.

The command parameter and its value are the following:

**<test>**

 1 – TX

**TX ON**

**<operation>**

 1 – ON

TX ON has the following parameters:

**<param0>**

 3GPP band number.

**<param1>**

 Frequency [100kHz]. Valid range 6000–22000 (corresponds to 600.0 MHz–2200.0 MHz).

**<param2>**

 TX signal power at the SiP antenna port [dBm].

 Valid range from +23 to −50.

**<param3>**

 System mode. Valid range 0–1. NB1 (0) or M1 (1).

 Note : Some LTE bands may be supported in only one of the system modes. To ensure that the band can be used, set the correct mode with %XSYSTEMMODE.


 Production test features

**<param4>**

 Modulation. 0 – QPSK 1 – 16QAM 2 – Reserved 3 – BPSK 4 – CW M1: QPSK, 16QAM, and CW NB1: QPSK, BPSK, and CW

 Note :

- If <param4> = CW, in system modes NB1 and M1 the CW tone is offset     by 255 kHz from the frequency given in <param1>. v1.0.x v1.1.x v1.2.x

- If <param4> = CW, the CW tone is offset from the frequency given in     <param1> by 48.75 kHz in system mode NB1 and by 401.25 kHz in system     mode M1. v1.2.x≥1 pti_v1.1.x≥1

**<param5>, <param6>, <param7>**

 <param5> Resource Block (RB) /Tone count <param6> RB /Tone start position <param7> Subcarrier spacing 0 – 15 k, 1 – 3.75 k. If <param4> = CW, then <param5>, <param6>, and <param7> = 0 (do not care)

**<param8> v1.2.x**

 System bandwidth. 0 – NB1 1 – 1.4 M 2 – reserved 3 – 5 MHz 4 to 6 – reserved

**<param9> v1.2.x**

 Narrowband index. 0 – 1.4 M 0 to 3 – 5 M Defined in 3GPP TS 36.211 Ch. 6.2.7.

 Note : <param9> has effect only when <param8> is 3 (5 MHz).


 Production test features

**<param10> v1.2.x≥1 pti_v1.1.x≥1**

 TX burst mode. 0 – Disable TX burst mode 1 – Enable TX burst mode For more information, see TX burst mode on page 170.

The allowed combinations for <param5>, <param6>, and <param7> for both system mode (<param3>) values are listed in the following table:

 System mode <param3> RB/Tone count <param5>

 RB/Tone start position <param6>

 Subcarrier spacing <param7>

 1 0–11 0 3 0, 3, 6, 9 0 6 0, 6 0 12 0 0

 NB1 (0)

 1 0–47 1 1 0–5 0 2 0–4 0 3 0–3 0 4 0–2 0 5 0–1 0

 M1 (1)

 6 0 0

 Table 2: Allowed parameter combinations for <param5>, <param6>, and <param7> in system modes NB1 and M1

 Note : In system mode M1, subcarrier spacing 3.75 kHz is not allowed.

Response syntax when <operation> is ON:

 %XRFTEST: <antenna_power>

The response value is the following:

**<antenna_power>**

 Internally measured TX power at the SiP antenna port in q4 dBm. q4 means that dividing the result by 2^4 = 16 gives dBm.

The following command example enables the RF transmitter for Band 5, 830.0 MHz, +17 dBm, NB1, BPSK, 12 tones, tone start position 0, subcarrier spacing 15 kHz, system bandwidth NB1, NB index 0, TX burst mode disabled:

 %XRFTEST=1,1,5,8300,17,0,3,12,0,0,0,0,0 %XRFTEST: 271 OK

 Note : 271/16 = 16.9 dBm


 Production test features

The following command example enables the RF transmitter for Band 5, 830 MHz, +17 dBm, M1, 16-QAM, 6 _RB_ , _RB_ start position 0, subcarrier spacing 15 kHz, system bandwidth 5 MHz, NB index 3, TX burst mode disabled::

 %XRFTEST=1,1,5,8300,17,1,1,6,0,0,3,3,0 %XRFTEST: 271 OK

**TX burst mode**

TX burst mode is enabled when <param10> is set to 1. The mode allows non-continuous TX transmission. The ON and OFF periods are based on the reference measurement channel uplink subframe scheduling that is defined for M1 in 3GPP TS 36.521 Annex A, Section A.2.2 and for NB1 in 3GPP TS 36.521 Annex A, Section A.2.4. The burst signal is transmitted until the **TX OFF** command is given. v1.2.1 pti_v1.1.x≥1

The following table describes the different waveforms supported by <param3>, <param4>, <param5>, and <param7>:

 System mode <param3> Modulation <param4> RB/Tone count <param5>

 Subcarrier spacing <param7>

 0 1 1

 0 1 0

 0 3 0

 0 6 0

 0 12 0

 3 1 0

 NB1 (0)

 3 1 1

 M1 (1) 0, 1 1–6 0

 Table 3: Allowed parameter combinations for <param3>, <param4>, <param5>, and <param7> in system modes NB1 and M1 when using TX burst mode

Response syntax when <operation> is ON and TX burst mode is enabled:

 %XRFTEST: OK

The following command example enables the RF transmitter for Band 5, 830 MHz, +17 dBm, M1, 16-QAM, 6 _RB_ , _RB_ start position 0, subcarrier spacing 15 kHz, system bandwidth 5 MHz, NB index 3, TX burst mode enabled:

 %XRFTEST=1,1,5,8300,17,1,1,6,0,0,3,3,1 OK

**TX OFF**

**<operation>**

 0 – OFF


 Production test features

The following command example disables the RF transmitter:

 %XRFTEST=1,0 OK

 Note : Always send the OFF command before sending another ON command.

11.2.1.3 GPS SNR testing

The command executes a _GPS SNR_ test.

_GPS_ L1 frequency is 1575.42 MHz and this test expects the _CW_ in signal generator to be 1575.750 MHz, i.e. the offset is 330 kHz. The measurement duration is 1 ms.

The command parameters and their defined values are the following:

**<test>**

 2 – GPS SNR

**<operation>**

 1 – ON

 Note : "OFF" is not needed due to automatic stop.

GPS SNR ON has three parameters:

**<param0>**

 RX signal power at the SiP GPS port in dBm. Valid range from −127 to −25 or 0 = default gain −105 dBm.

**<param1> v1.2.x pti_v1.1.x≥1**

 AFC correction. 1 – Enable AFC correction in measurement 0 – Disable AFC correction in measurement

**<param2> v1.2.x pti_v1.1.x≥1**

 Frequency. Manually give RF frequency for nRF9160 in the 100 kHz format. Accepted value is +/10 MHz from the default GPS frequency of 1575.42 MHz. Set the signal generator to f = <param2> + 330 kHz.

 Note : If <param2> is not given, nRF9160 uses the default GPS L1 frequency 1575.42 MHz.

 Note : It is recommended to set the signal level defined in the GPS SNR ON parameters to the expected signal level at the GPS antenna port of the nRF9160 SiP.

Response syntax when <operation> is ON:

 %XRFTEST: <snr>,<antenna_power>

The response value is the following:


 Production test features

**<snr>**

 The result of the SNR measurement in q4 dB. q4 means that dividing the result by 24 = 16 gives dB.

**<antenna_power>**

 Measured signal power at the SiP GPS port in q8 dBm. q8 means that dividing the result by 2^8 = 256 gives dBm.

The following command example executes a _GPS SNR_ test, AFC disabled:

 %XRFTEST=2,1,0,0 %XRFTEST: 514,-19968 OK

 Note : 514/16 = 32.125 dB and −19968/256 = −78 dBm.

The following command example executes an _GPS SNR_ test for -80 dBm. AFC correction is enabled and uses the result of the previous AFC measurement or AFC set. Instead of the default, the receiver frequency is set to 1575.0 MHz:

 %XRFTEST=2,1,-80,1,15750 %XRFTEST: 312,-20480 OK

 Note : 312/16 = 19.5 dB and -20480/256 = -80 dBm.

11.2.1.4 RX SNR testing

To measure _SNR_ correctly, the _CW_ offset must be +330 kHz for the M1 mode and +45 kHz for NB1.

The parameters and their values are the following:

**<test>**

 3 – RX SNR

**<operation>**

 1 – ON

 Note : "OFF" is not needed due to automatic stop.

**<param0>**

 3GPP band number. Use 24 for GPS reception.

**<param1>**

 Frequency 100 kHz (,i.e. 2140 MHz is expressed as 21400).

**<param2>**

 RX signal power at the SiP antenna port in dBm.

 Valid range from −127 to −25.

**<param3>**

 System mode. Valid range 0–1. NB1 (0) or M1 (1).


 Production test features

**<param4> v1.2.x pti_v1.1.x≥1**

 Enabling AFC correction during SNR test.

 1 – Enable 0 – Disable If <param4> is not given, AFC correction is disabled.

Response syntax when <operation> is ON:

 %XRFTEST: <snr>,<antenna_power>

The response parameters and their values are the following:

**<snr>**

 Result of the SNR measurement in q4 dB. q4 means that dividing the result by 2^4 = 16 dB.

**<antenna_power>**

 Measured signal power at the SiP antenna port in q8 dBm. q8 means divided dividing the result by 2^8 = 256 gives dBm.

The following command example enables the RX SNR measurement and RF receiver for Band 1, 2140.0 MHz, −65 dBm, M1 mode, AFC correction enabled:

 %XRFTEST=3,1,1,21400,-65,1,1 %XRFTEST: 496,-17002 OK

 Note : 496/16 = 31 dB and −17002/256 = −66.4 dBm.

11.2.1.5 AFC measurement and set

The command measures or sets the AFC error value for a given frequency. The default error value is 0. v1.2.x pti_v1.1.x≥1

Some frequency error may occur because the signal generator’s and nRF9160’s reference clocks are different. This test allows to measure or set frequency error and use the result value as compensation in subsequent tests. This improves the correctness of _SNR_ tests and transmission frequency, but has no significant effect on the power measurement results in RX ON or TX ON tests. The relative Q30 formatted response value is stored in device memory and can be used in RX and _GPS SNR_ tests if the AFC correction enabling parameter, for example <param4> in the RX _SNR_ test, is 1.

The measurement expects the _CW_ in the signal generator to be 120 kHz lower than the given frequency. For example, if DUT frequency is 830 MHz, the signal generator must be set to 829.880 MHz.

 Note : The same result value is used automatically in TX ON and RX ON tests.

The command parameters and their defined values are the following:

**<test>**

 4 – AFC


 Production test features

**AFC measurement**

**<operation>**

 1 – ON (measure)

 Note : "OFF" is not needed due to automatic stop. Mode is always M1. The stored value is reset when the device is booted.

AFC measurement has the following parameters:

**<param0>**

 3GPP band number

**<param1>**

 Frequency (100 kHz)

**<param2>**

 RX signal power at the SiP antenna port in dBm

Response syntax when <operation> is ON:

 %XRFTEST: <AFC_error_value_Hz>,<AFC_error_value_Q30>

The response parameters and their values are the following:

**<AFC_error_value_Hz>**

 Measured AFC error value in Hz format

**<AFC_error_value_Q30> v1.2.x≥1 pti_v1.1.x≥1**

 Measured AFC error value in relative signed Q30 format

The following command example measures the AFC error value for band 1, 2140.0 MHz, -40 dBm:

 %XRFTEST=4,1,1,21400,-40 %XRFTEST:349,175 OK

**AFC set**

The command allows to manually set the AFC error value in Hz or relative Q30 format, which can be used in RX and _GPS SNR_ tests if the AFC correction enabling parameter, for example <param4> in the RX SNR test, is 1. The value set with this command overwrites the value obtained with AFC measurement.

This value is used automatically in the RX ON and TX ON tests. To not use the AFC error value, for example in TX ON or RX ON tests, set it to 0.

The command parameter and its value are the following:

**<operation>**

 3 – SET

AFC SET has the following parameters:

**<param0>**

 AFC error value (Hz), if <param1> = 0 or not given. AFC error value (relative signed Q30), if <param1> = 1. v1.2.1 pti_v1.1.x≥1


 Production test features

**<param1> v1.2.x≥1 pti_v1.1.x≥1**

 AFC error format. 0 – AFC error value interpreted as Hz format 1 – AFC error value interpreted as relative signed Q30 format

Response syntax when <operation> is SET:

 %XRFTEST: OK

The following command example sets AFC error value to 349 Hz:

 %XRFTEST=4,3,349,0 OK

 Note : In the AFC correction feature, if the set error value is given in Hz format, the relative signed Q30 value is automatically calculated when used in the next test for a given frequency. The relative error is used automatically in subsequent tests. The suitable error value can be calculated for any frequency with the following formula: error_in_hz_f2 = error_in_hz_f1 * f2 / f1. For example, if error is measured as 120 Hz at 2140 MHz, the error at 1950 MHz is 120 Hz * 1950 MHz/2140 MHz = 109 Hz.

11.2.1.6 RF sensor testing

The command allows to read the temperature sensor next to the _Power Amplifier (PA)_ inside the _SiP_ and another temperature sensor inside the nRF9120 _System on Chip (SoC)_. v1.2.x pti_v1.1.x≥1

When the modem is active (either LTE communication or _GPS_ receiver), the command with <param0>=0 returns the latest _PA_ temperature sensor value measured automatically during modem wakeup or transmission. The temperature is not measured during LTE or _GPS_ reception, because _PA_ is not in use. During modem inactivity, the modem measures the _PA_ temperature value when the command is received.

The command with <param0>=1 returns the _SoC_ internal temperature sensor value with the same restrictions that apply to _PA_ temperature measurement regarding modem activity. When the _GPS_ receiver is active, the _SoC_ internal temperature sensor value is updated more regularly. During LTE, the value is updated only at wakeup.

The command parameters and their defined values are the following:

**<test>**

 10 – Sensor test

**<operation>**

 1 – ON (measure)

**<param0>**

 0 – PA temperature 1 – SoC internal temperature sensor v1.2.x≥1 pti_v1.1.x≥1 2 – Reserved 3 – VBAT (same as %XVBAT ) 4 – Reserved


 Production test features

Response syntax when <param0> = 0 or <param0> = 1:

 %XRFTEST: <temperature> OK

When <param0> = 0 or <param0> = 1, the response is given in millidegrees Celsius, with a resolution of approximately 50 millidegrees Celsius.

Response syntax when <param0> = 3:

 %XRFTEST: <vbat> OK

When <param0> = 3, the response is given in millivolts.

The following command example measures the _PA_ temperature which is approximately 20.4 Celsius:

 AT%XRFTEST=10,1,0 %XRFTEST: 20355 OK

11.2.2 Read command

The read command is not supported.

11.2.3 Test command

The test command is not supported.

##### 11.3 Modem GPIO functionality test %XGPIOTEST

The Nordic-proprietary **%XGPIOTEST** tests the functionality of the modem _GPIO_ pins. pti_v1.1.x≥1

11.3.1 Set command

The set command allows the input and output control of the following modem _GPIO_ pins: **SIM_INT** , **SIM_RST** , **SIM_CLK** , **SIM_IO** , **COEX0** , **COEX1** , and **COEX2**.

Syntax:

 AT%XGPIOTEST=<direction>,<mask>,<pin_ctrl>

Control for some pins is allowed as either input or output. The following are the allowed pin control directions and bit positions in <mask> and <pin_ctrl>:

- SIM_INT – Input

- SIM_RST – Output

- SIM_CLK – Output

- SIM_IO – Input/Output

- COEX0 – Input/Output

- COEX1 – Output

- COEX2 – Input/Output

The set command parameters and their defined values are the following:


 Production test features

**<direction>**

 0 – Output 1 – Input

**<pin_ctrl>**

 Bits for controlling each masked pin. If <direction> is output, 1 sets the pin high and 0 sets the pin low. If <direction> is input, 1 needs to be set for each pin whose state is read.

The following command example configures all pins as output and sets their state low:

 AT%XGPIOTEST=0,255,0 %XGPIOTEST: OK

The following command example sets all pins as input and reads the pin state of each pin:

 AT%XGPIOTEST=1,255,255 %XGPIOTEST: 0x9 OK

11.3.2 Read command

The read command is not supported.

11.3.3 Test command

The test command is not supported.

##### 11.4 File system sync to flash %XFSSYNC

The Nordic-proprietary **%XFSSYNC** command synchronizes and stores AT command configurations to the modem’s non-volatile memory. pti_v1.1.x≥1

11.4.1 Set command

The set command writes user-modified configuration data to the modem's non-volatile memory so that the data persists through the power off cycles. When using PTI firmware, this command must be used instead of AT+CFUN=0 to store configuration data to non-volatile memory.

The command stores to the non-volatile memory configurations that are set with the following commands:

- AT%XMAGPIO

- AT%XMIPIRFFEDEV

- AT%XMIPIRFFECTRL

- AT%XCOEX0

- AT%XANTCFG

- AT%XEMPR

Syntax:

 AT%XFSSYNC


 Production test features

11.4.2 Read command

The read command is not supported.

11.4.3 Test command

The test command is not supported.


# 12 Authenticating AT command usage

 The %XSUDO is used to authenticate AT commands.

 Before you start the authentication, perform the following two steps (only once):

**1.** Generate private and public keys with OpenSSL:

 openssl ecparam -name prime256v1 -genkey -noout -out [private key PEM file] openssl ec -in [private key PEM file] -out [public key PEM file] -pubout

**2.** Write the public key with the AT command:

 AT%XPMNG=0,”<public key>” OK

 To authenticate an AT command, perform the following steps:

**1.** Calculate an AT command signature.     a) Create an AT command text file for an authenticated AT command:        Example:

 %CMNG=0,1,0,”TEST ROOT CERTIFICATE”

 b) Create a digest file with OpenSSL from AT command that needs authentication:

 openssl sha256 -binary [AT command text file] > [digest file]

 c) Create a signature file with OpenSSL from the digest file:

 openssl pkeyutl -sign -in [digest file] -out [signature file] -inkey [private key PEM file]

 d) Convert the signature to Base64 format:

 base64 < [signature file] > [signature base64 file]

**2.** Write the authenticated AT command.     The **%XSUDO** command is used to authenticate the **%CMNG** command:     Example:

 AT%XSUDO=35,”<signature base64>”;%CMNG=0,1,0,”TEST ROOT CERTIFICATE” OK

 For more information on the command, see Authenticated access %XSUDO on page 45.


#### Glossary

**16-state Quadrature Amplitude Modulation (16-QAM)**

 A digital modulation technique used for signals in which four bits are modulated at once by selecting one of 16 possible combinations of carrier phase shift and amplitude.

**Access Point Name (APN)**

 The name of a gateway between a mobile network and another computer network, usually the Internet.

**Application Protocol Data Unit (APDU)**

 The communication unit between a terminal and smart card ( UICC ).

**Binary Phase-Shift Keying (BPSK)**

 A digital modulation technique used for signals in which one bit is modulated by selecting one of two possible carrier phase shifts with a 180-phase difference.

**Carrier Wave (CW)**

 A single-frequency electromagnetic wave that can be modulated in amplitude, frequency, or phase to convey information.

**Cat-M1**

 LTE-M User Equipment (UE) category with a single RX antenna, specified in 3GPP Release 13.

**Cat-NB1**

 Narrowband Internet of Things (NB-IoT) User Equipment (UE) category with 200 kHz UE bandwidth and a single RX antenna, specified in 3GPP Release 13.

**Check Digit (CD)**

 The last one-digit number of the IMEI code used for error detection.

**Classless Inter-domain Routing (CIDR)**

 A method for allocating IP (Internet Protocol) addresses.

**CS/PS Mode of Operation**

 A UE mode of operation. The UE may either register to packet-switched services, circuit-switched services, or both based on the mode of operation. If both are registered, the mode of operation also contains a preference for either of them.

**Discontinuous Reception (DRX)**

 A method in mobile communication to conserve the battery of a mobile device by turning the RF modem in a sleep state.

**Dynamic Host Configuration Protocol (DHCP)**

 A network management protocol used for automatic and centralized management of IP addresses within a network.

**Electronic Serial Number (ESN)**


 A unique number embedded on a microchip for identifying mobile devices.

**EPS Mobility Management (EMM)**

 The EPS Mobility Management (EMM) sublayer in the NAS protocol provides mobility service to the UE.

**E-UTRA Absolute Radio Frequency Channel Number (EARFCN)**

 LTE carrier channel number for unique identification of LTE band and carrier frequency.

**Evolved Packet System (EPS)**

 A connection-oriented transmission network in LTE (Long-term Evolution) consisting of an EPC (Evolved Packet Core) and an E-UTRAN (Evolved Terrestrial Radio Access Network).

**Extended Discontinuous Reception (eDRX)**

 A method to conserve the battery of an IoT (Internet of Things) device by allowing it to remain inactive for extended periods.

**Global Navigation Satellite System (GNSS)**

 A satellite navigation system with global coverage. The system provides signals from space transmitting positioning and timing data to GNSS receivers, which use this data to determine location.

**General Packet Radio Services (GPRS)**

 A packet-based mobile data service for 2G and 3G mobile networks with data rates of 56-114 kbps/ second and continuous connection to the Internet.

**GPIO**

 General-Purpose Input/Output

**Global Positioning System (GPS)**

 A satellite-based radio navigation system that provides its users with accurate location and time information over the globe.

**Integrated Circuit Card Identifier (ICCID)**

 A unique serial number of a SIM card.

**International Mobile (Station) Equipment Identity (IMEI)**

 A unique code consisting of 14 digits and a check digit for identifying 3GPP-based mobile devices.

**International Mobile (Station) Equipment Identity, Software Version (IMEISV)**

 A unique code consisting of 16 decimal digits and two software version digits for identifying 3GPPbased mobile devices.

**International Mobile Subscriber Identity (IMSI)**

 A unique code, usually 15 digits, used for the identification of a mobile subscriber and consisting of an MCC , MNC , and MSIN (Mobile Subscription Identification Number).

**International Reference Alphabet (IRA)**

 A seven-bit coded character set for information exchange.


**Low-Noise Amplifier (LNA)**

 In a radio receiving system, an electronic amplifier that amplifies a very low-power signal without significantly degrading its signal-to-noise ratio.

**Maximum Transmission Unit (MTU)**

 The largest packet or frame that can be sent in a single network layer transaction.

**MIPI RF Front-End Control Interface (RFFE)**

 A dedicated control interface for the RF front-end subsystem. MIPI Alliance

**Mobile Country Code (MCC)**

 A unique three-digit part of an IMSI code identifying the country of domicile of the mobile subscriber. MCC is used together with the Mobile Network Code (MNC).

**Mobile Equipment (ME)**

 The physical UE consisting of one of more MT and one or more TE.

**Mobile Network Code (MNC)**

 A code identifying the telecommunications network. The code is defined by ITU-T Recommendation E.212, consists of two or three decimal digits, and is used together with the Mobile Country Code (MCC).

**Mobile Station International Subscriber Directory Number (MSISDN)**

 A number consisting of a maximum of 15 digits identifying a mobile subscriber by mapping the telephone number to the SIM card in a phone.

**Mobile Termination (MT)**

 A component of the Mobile Equipment (ME) performing functions specific to management of the radio interface. The R interface between TE and MT uses the AT command set. The IMEI code is attached to the MT.

**Non-access Stratum (NAS)**

 In telecom protocol stacks, the highest stratum of the control plane between the core network and UE. The layer is used to manage the establishment of communication sessions and for maintaining communications with the UE as it moves.

**Non-access Stratum (NAS) Signalling Low Priority Indication (NSLPI)**

 Used by the network for NAS-level mobility management congestion control.

**Non-volatile Memory (NVM)**

 Memory that can retrieve stored information even after having been power-cycled.

**Packet Data Network (PDN)**

 A network that provides data services.

**Packet Data Protocol (PDP)**

 A packet transfer protocol in wireless GPRS (General Packet Radio Services) and HSDPA (High-speed Downlink Packet Access) networks.


**Packet Data Protocol (PDP) Context**

 In UMTS (Universal Mobile Telecommunications System) and GPRS (General Packet Radio Service), the record that specifies UE access to an external packet-switched network.

**Paging Time Window (PTW)**

 The period of time during which the User Equipment (UE) attempts to receive a paging message.

**Personal Identification Number (PIN)**

 An optional security feature in mobile devices used for identifying a user. PIN is a numeric code which must be entered each time a mobile device is started.

**Personal Unblocking Key (PUK)**

 A digit sequence required in 3GPP mobile phones to unlock a SIM that has disabled itself after an in correct personal identification number has been entered multiple times.

**Power Amplifier (PA)**

 A device used to increase the transmit power level of a radio signal.

**Power Saving Mode (PSM)**

 A feature introduced in 3GPP Release 12 to improve battery life of IoT (Internet of Things) devices by minimizing energy consumption. The device stays dormant during the PSM window.

**Pre-shared Key (PSK)**

 A password authentication method, a string of text, expected before a username and password to establish a secured connection. Also known as a "shared secret".

**Printed Circuit Board (PCB)**

 A board that connects electronic components.

**Privacy Enhanced Mail (PEM)**

 A public key certificate defined in the X.509 cryptography standard and used to privately transmit email.

**Production Test Image (PTI)**

 A modem firmware version used in the device manufacturing phase.

**Protocol Configuration Options (PCO)**

 An element of NAS message used for transferring parameters between the UE and the P-GW (Packet Data Network Gateway).

**Protocol Data Unit (PDU)**

 Information transferred as a single unit between peer entities of a computer network and containing control and address information or data. PDU mode is one of the two ways of sending and receiving SMS messages.

**PS Mode of Operation**

 A UE mode of operation. The UE registers only to EPS services.

**Public Land Mobile Network (PLMN)**


 A network that provides land mobile telecommunications services to the public. A PLMN is identified by the MCC and MNC.

**Quadrature Phase-Shift Keying (QPSK)**

 A digital modulation technique used for signals in which two bits are modulated at once, selecting one of four possible carrier phase shifts.

**Quality of Service (QoS)**

 The measured overall performance of a service, such as a telephony or computer network, or a cloud computing service.

**Radio Policy Manager (RPM)**

 A radio baseband chipset feature that protects the mobile network from signaling overload.

**Reference Signal Received Power (RSRP)**

 The average power level received from a single reference signal in an LTE (Long-Term Evolution) network.

**Reference Signal Received Quality (RSRQ)**

 The quality of a single reference signal received in an LTE (Long-Term Evolution) network and calculated from RSRP.

**Resource Block (RB)**

 The smallest unit of resources that can be allocated to a user.

**RP-SMMA**

 A message sent by the User Equipment to relay a notification to the network that the mobile has memory available to receive one or more short messages.

**Serial Number (SNR)**

 A unique six-digit number part of the IMEI code identifying each equipment within each TAC.

**Signal-to-Noise Ratio (SNR)**

 The level of signal power compared to the level of noise power, often expressed in decibels (dB).

**Software Version Number (SVN)**

 Part of the IMEI code identifying the revision of the software installed on a mobile device.

**Subscriber Identity Module (SIM)**

 A card used in UE containing data for subscriber identification.

**System in Package (SiP)**

 A number of integrated circuits, often from different technologies, enclosed in a single module that performs as a system or subsystem.

**System on Chip (SoC)**

 A microchip that integrates all the necessary electronic circuits and components of a computer or other electronic systems on a single integrated circuit.


**Terminal Adapter (TA)**

 A device that connects a UE to a communications network. In mobile networks, the terminal adapter is used by the terminal equipment to access the mobile termination using AT commands.

**Terminal Equipment (TE)**

 Communications equipment at either end of a communications link, used to permit the stations involved to accomplish the mission for which the link was established.

**Tracking Area Code (TAC)**

 A unique code used to identify a tracking area within a particular network.

**Tracking Area Update (TAU)**

 A procedure initiated by the UE when moving to a new tracking area in the LTE (Long-term Evolution) system.

**Type Allocation Code (TAC)**

 The initial eight-digit part of an IMEI code used for identifying the model of a mobile phone.

**Universal Asynchronous Receiver/Transmitter (UART)**

 A hardware device for asynchronous serial communication between devices.

**User Equipment (UE)**

 Any device used by an end-user to communicate. The UE consists of the Mobile Equipment (ME) and the Universal Integrated Circuit Card (UICC).

**Universal Integrated Circuit Card (UICC)**

 A new generation SIM used in UE for ensuring the integrity and security of personal data.

**Unique Slave Identifier (USID)**

 A unique address for identifying each slave device in an RFFE (RF Front-End) system.

**Universal Subscriber Identity Module (USIM)**

 A card used in UE containing data for subscriber identification.


### Acronyms and abbreviations

These acronyms and abbreviations are used in this document.

**16-QAM** 16-state Quadrature Amplitude Modulation

**APN** Access Point Name

**APDU** Application Protocol Data Unit

**BPSK** Binary Phase-Shift Keying

**Cat-M1**

**Cat-NB1**

**CD** Check Digit

**CIDR** Classless Inter-Domain Routing

**CS** Circuit-Switched

**DER** Distinguished Encoding Rules

**DHCP** Dynamic Host Configuration Protocol

**DRX** Discontinuous Reception

**EARFCN** E-UTRA Absolute Radio Frequency Channel Number

**eDRX** Extended Discontinuous Reception

**EMM** EPS Mobility Management

**EPS** Evolved Packet System

**ESN** Electronic Serial Number

**E-UTRA** Evolved Universal Terrestrial Radio Access


 Acronyms and abbreviations

**E-UTRAN** Evolved Terrestrial Radio Access Network

**GNSS** Global Navigation Satellite System

**GPIO** General-Purpose Input/Output

**GPS** Global Positioning System

**GPRS** General Packet Radio Services

**ICCID** Integrated Circuit Card Identifier

**IMEI** International Mobile (Station) Equipment Identity

**IMEISV** International Mobile (Station) Equipment Identity, Software Version

**IMSI** International Mobile Subscriber Identity

**IRA** International Reference Alphabet

**LNA** Low-Noise Amplifier

**MCC** Mobile Country Code

**ME** Mobile Equipment

**MIPI RFFE** MIPI RF Front-End Control Interface

**MNC** Mobile Network Code

**MSISDN** Mobile Station International Subscriber Directory Number

**MT** Mobile Termination

**MTU** Maximum Transmission Unit

**NAS** Non-access Stratum


 Acronyms and abbreviations

**NSLPI** NAS Signalling Low Priority Indication

**NVM** Non-volatile Memory

**PA** Power Amplifier

**PCB** Printed Circuit Board

**PCO** Protocol Configuration Options

**PDP** Packet Data Protocol

**PDN** Packet Data Network

**PDU** Protocol Data Unit

**PEM** Privacy Enhanced Mail

**PIN** Personal Identification Number

**PKCS** Public Key Cryptography Standards

**PLMN** Public Land Mobile Network

**PS** Packet-Switched

**PSK** Pre-shared Key

**PSM** Power Saving Mode

**PTI** Production Test Image

**PTW** Paging Time Window

**PUK** Personal Unblocking Key

**QoS** Quality of Service


 Acronyms and abbreviations

**QPSK** Quadrature Phase-Shift Keying

**RAU** Routing Area Update

**RB** Resource Block

**RP-ACK** Reply Path Acknowledgement

**RP-ERROR** Reply Path Error

**RPM** Radio Policy Manager

**RSRP** Reference Signal Received Power

**RSRQ** Reference Signal Received Quality

**SIM** Subscriber Identity Module

**SiP** System in Package

**SNR** Serial Number

**SNR** Signal-to-Noise Ratio

**SVN** Software Version Number

**TA** Terminal Adapter

**TAC** Tracking Area Code Type Allocation Code

**TAU** Tracking Area Update

**TE** Terminal Equipment

**UART** Universal Asynchronous Receiver/Transmitter

**UE** User Equipment


 Acronyms and abbreviations

**UICC** Universal Integrated Circuit Card

**USIM** Unique Slave Identifier

**USIM** Universal Subscriber Identity Module

**UUID** Universally Unique Identifier


### Legal notices

By using this documentation you agree to our terms and conditions of use. Nordic Semiconductor may change these terms and conditions at any time without notice.

**Liability disclaimer**

Nordic Semiconductor ASA reserves the right to make changes without further notice to the product to improve reliability, function, or design. Nordic Semiconductor ASA does not assume any liability arising out of the application or use of any product or circuits described herein.

Nordic Semiconductor ASA does not give any representations or warranties, expressed or implied, as to the accuracy or completeness of such information and shall have no liability for the consequences of use of such information. If there are any discrepancies, ambiguities or conflicts in Nordic Semiconductor’s documentation, the Product Specification prevails.

Nordic Semiconductor ASA reserves the right to make corrections, enhancements, and other changes to this document without notice.

**Life support applications**

Nordic Semiconductor products are not designed for use in life support appliances, devices, or systems where malfunction of these products can reasonably be expected to result in personal injury.

Nordic Semiconductor ASA customers using or selling these products for use in such applications do so at their own risk and agree to fully indemnify Nordic Semiconductor ASA for any damages resulting from such improper use or sale.

**RoHS and REACH statement**

Complete hazardous substance reports, material composition reports and latest version of Nordic's REACH statement can be found on our website [http://www.nordicsemi.com.](http://www.nordicsemi.com.)

**Trademarks**

All trademarks, service marks, trade names, product names, and logos appearing in this documentation are the property of their respective owners.

**Copyright notice**

© 2020 Nordic Semiconductor ASA. All rights are reserved. Reproduction in whole or in part is prohibited

without the prior written permission of the copyright holder.

*/
