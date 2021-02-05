/* Mobile termination control and status commands
 *
 * Mobile termination control and status commands are used for mobile
 * terminated power and indicator handling.Two commands are listed for
 * accessing SIM / Universal Integrated Circuit Card(UICC) database records.
 */

const { ATCommand } = require('./at_command');

// 5.1
export class AT_CFUN extends ATCommand {
    /*! Functional mode */
    constructor() {
        super('+CFUN');
    }

    set(fun: number) {
        /*!
The command sets the functional mode to Minimum (Power off), Normal, or
Offline mode (Flight mode). There is a specific mode for Flight mode with UICC
on. It is also possible to activate or deactivate LTE or GNSS separately.

Syntax:

    +CFUN=<fun>

The set command parameters and their defined values are the following:

**<fun>**
    0 – Sets the device to minimum functionality. Disables both transmit and
        receive RF circuits and deactivates LTE and Global Navigation Satellite
        System (GNSS) services.
    1 – Sets the device to full functionality.
    4 – Sets the device to flight mode. Disables both transmit and receive RF
        circuits and deactivates LTE and GNSS services. 20 – Deactivates LTE
        without shutting down GNSS services.
    21 – Activates LTE without changing GNSS.
    30 – Deactivates GNSS without shutting down LTE services.
    31 – Activates GNSS without changing LTE.
    40 – Deactivates UICC.
    41 – Activates UICC.
    44 – Sets the device to flight mode without shutting down UICC.

Note:
- **%XSYSTEMMODE** should be used for enabling system modes. It is possible to
  activate enabled modes.
- The response to changing to Normal mode could be ERROR if the _SIM_ card has failed.
- Commanding the device to Power off or to Offline mode might take some time
  if signaling with the network is needed.
- When commanding the device to power off, wait for OK to make sure that
  _Non-volatile Memory_ _(NVM)_ has been updated.
- CFUN=41 is allowed only when LTE Cat-M1 or LTE Cat-NB1 is enabled by **%XSYSTEMMODE**.
- _UICC_ initialization is started in modes CFUN=1, CFUN=21, and CFUN=41.
  **%XSIM** indications shall be followed for the _UICC_ state.
- The configuration made with an AT command can be stored in _NVM_ using AT+CFUN=0
  if the option is mentioned in the description of the command. This is useful
  if the command relates to a permanent hardware configuration, because it
  avoids the need to give the command every time in the beginning of the application.

The following command example activates the modem Normal mode:

    AT+CFUN=1
    OK
*/
        return {
            command: `AT${this.command}=${fun}`,
            parser(input: string) {
                return input;
            },
        };
    }

    read() {
        /*!
The command reads the current functional mode.

Response syntax:

    +CFUN: <fun>

The read response parameter and its defined value is the following:

**<fun>**
    0 – Power off and store. RF circuits are disabled by deactivating LTE and GNSS services.
    1 – Normal mode. The active mode is either LTE or GNSS, or both.
        Full functional mode. Active modes depend on %XSYSTEMMODE setting.
    4 – Flight mode. RF circuits are disabled by deactivating LTE and GNSS services.

The following command example reads the current functional mode:

    AT+CFUN?
    +CFUN: 1
    OK
*/
        return {
            command: `AT${this.command}?`,
            parser(input) {
                return input;
            },
        };
    }

    test() {
        /*!
The test command lists supported functional modes.

Response syntax:

    +CFUN: (list of supported <fun>s)

The response parameters and their defined values are the following:

**<fun>**
    0 – Sets the device to minimum functionality. Disables both transmit and receive
        RF circuits and deactivates LTE and GNSS services.
    1 – Sets the device to full functionality.
    4 – Sets the device to flight mode. Disables both transmit and receive RF
        circuits and deactivates LTE and GNSS services.
    20 – Deactivates LTE without shutting down GNSS services.
    21 – Activates LTE without changing GNSS.
    30 – Deactivates GNSS without shutting down LTE services.
    31 – Activates GNSS without changing LTE.
    40 – Deactivates UICC.
    41 – Activates UICC.
    44 – Sets the device to flight mode without shutting down UICC.

The following command example returns the supported functional modes.

    AT+CFUN=?
    +CFUN: (0,1,4,20,21,30,31,40,41,44)
    OK
*/
        return {
            command: `AT${this.command}=?`,
            parser(input) {
                return input;
            },
        };
    }
}

export const remove_this = 1;

/*

##### 5.2 PIN code +CPIN

The **+CPIN** command enters and checks the required _Personal Identification Number (PIN)_. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 8.3_.

5.2.1 Set command

The set command enters the _PIN_.

Syntax:

 +CPIN=<pin>[,<newpin>]

The set command parameters and their defined values are the following:

**<pin>**

 String of digits.

**<newpin>**

 String of digits. Mandatory if the required code is SIM Personal Unblocking Key (PUK) or SIM PUK2.

 Note : If no PIN is required, the response code is ERROR.

The following command example will enter PIN 1234.

 AT+CPIN="1234" OK


 Mobile termination control and status commands

5.2.2 Read command

The read command checks if a _PIN_ is needed or if a personalization lock is blocking the device start-up.

Response syntax:

 +CPIN: <code>

The read command parameter and its defined values are the following:

**<code>**

 READY – No PIN required SIM PIN – PIN code required SIM PUK – PUK code required SIM PIN2 – PIN2 code required SIM PUK2 – PUK2 code required PH-SIM PIN – USIM depersonalization required v1.2.x PH-NET PIN – Network depersonalization required v1.2.x PH-NETSUB PIN – Network subset depersonalization required v1.2.x PH-SP PIN – Service provider depersonalization required v1.2.x PH-CORP PIN – Corporate depersonalization required v1.2.x

The following command example shows how to check if a PIN code is needed with the response that a PIN code is required:

 AT+CPIN? +CPIN: "SIM PIN" OK

 Note : Use AT%XUSIMLCK when facility lock depersonalization is required.

5.2.3 Test command

The test command is not supported.

##### 5.3 Remaining PIN retries +CPINR

The **+CPINR** command returns the number of remaining _PIN_ retries for the _UE_ passwords. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 8.65_.

5.3.1 Set command

The set command returns the number of remaining _PIN_ retries for the _UE_ passwords.

Command syntax:

 +CPINR=<sel_code>


 Mobile termination control and status commands

Response syntax for standard PINs:

 +CPINR: <code>,<retries>

Manufacturer-specific PINs are not supported.

The command parameters and their defined values are the following:

**<sel_code>, <code>**

 SIM PIN SIM PIN2 SIM PUK SIM PUK2 Wildcard not supported.

**<retries>**

 Integer. Number of remaining retries.

The following command example checks the remaining entries for PIN:

 AT+CPINR="SIM PIN" +CPINR: "SIM PIN",3 OK

5.3.2 Read command

The read command is not supported.

5.3.3 Test command

The test command is not supported.

##### 5.4 List all available AT commands +CLAC

The **+CLAC** command returns a list of all available AT commands. v1.0.x v1.1.x v1.2.x pti_v1.1.x≥1

For reference, see _3GPP 27.007 Ch. 8.37_.

5.4.1 Set command

The set command returns a list of all available AT commands.

Syntax:

 +CLAC

Response syntax:

 <AT Command1>[<CR><LF><AT Command2>[...]]


 Mobile termination control and status commands

The following command example lists the supported AT commands:

 AT+CLAC AT+CFUN AT+COPS ... OK

5.4.2 Read command

The read command is not supported.

5.4.3 Test command

The test command is not supported.

##### 5.5 Extended signal quality +CESQ

The **+CESQ** command returns received signal quality parameters. This command issues a valid response only when the modem is activated. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 8.69_.

 Note : When NB1 system mode is used and the device is in RRC connected state, old signal quality parameter values are reported. The values are recorded and reported from the previous idle state. v1.0.x v1.1.x v1.2.x≤1

5.5.1 Set command

The set command returns received signal quality parameters.

Syntax:

 +CESQ

Response syntax:

 +CESQ: <rxlev>,<ber>,<rscp>,<ecno>,<rsrq>,<rsrp>

The set command parameters and their defined values are the following:

**<rxlev>**

 99 – Not known or not detectable

**<ber>**

 99 – Not known or not detectable

**<rscp>**

 255 – Not known or not detectable

**<ecno>**

 255 – Not known or not detectable


 Mobile termination control and status commands

**<rsrq>**

 0 rsrq < −19.5 dB 1 – When −19.5 dB ≤ RSRQ < −19 dB 2 – When −19 dB ≤ RSRQ < −18.5 dB ... 32 – When −4 dB ≤ RSRQ < −3.5 dB 33 – When −3.5 dB ≤ RSRQ < −3 dB 34 – When −3 dB ≤ RSRQ 255 – Not known or not detectable

**<rsrp>**

 0 – RSRP < −140 dBm 1 – When −140 dBm ≤ RSRP < −139 dBm 2 – When −139 dBm ≤ RSRP < −138 dBm ... 95 – When −46 dBm ≤ RSRP < −45 dBm 96 – When −45 dBm ≤ RSRP < −44 dBm 97 – When −44 dBm ≤ RSRP 255 – Not known or not detectable

The following command example reads the current signal quality, mapped _Reference Signal Received Quality (RSRQ)_ 31, and _Reference Signal Received Power (RSRP)_ 62:

 AT+CESQ +CESQ: 99,99,255,255,31,62 OK

5.5.2 Read command

The read command is not supported.

5.5.3 Test command

The test command returns supported values as compound values.

Response syntax:

 +CESQ: (list of supported <rxlev>s),(list of supported <ber>s),(list of supported <rscp>s), (list of supported <ecno>s),(list of supported <rsrq>s),(list of supported <rsrp>s)

The following command example returns supported values as compound values.

 AT+CESQ=? +CESQ: (99),(99),(255),(255),(0-34,255),(0-97,255) OK


 Mobile termination control and status commands

##### 5.6 Signal quality notification %CESQ

The Nordic-proprietary **%CESQ** command subscribes or unsubscribes notifications of changes in signal quality. v1.0.x v1.1.x v1.2.x

 Note : When NB1 system mode is used and the device is in RRC connected state, old signal quality parameter values are reported. The values are recorded and reported from the previous idle state. v1.0.x v1.1.x v1.2.x≤1

5.6.1 Set command

The set command subscribes or unsubscribes notifications of changes in signal quality.

Syntax:

 %CESQ=<n>

Notification syntax:

 %CESQ: <rsrp>,<rsrp_threshold_index>,<rsrq>,<rsrq_treshold_index>

The set command parameters and their defined values are the following:

**<n>**

 0 – Unsubscribe signal quality notifications 1 – Subscribe signal quality notifications

**<rsrp>**

 0 – RSRP < −140 dBm 1 – When −140 dBm ≤ RSRP < −139 dBm 2 – When −139 dBm ≤ RSRP < −138 dBm ... 95 – When −46 dBm ≤ RSRP < −45 dBm 96 – When −45 dBm ≤ RSRP < −44 dBm 97 – When −44 dBm ≤ RSRP 255 – Not known or not detectable

**<rsrp_threshold_index>**

 Index of RSRP threshold which is below measured RSRP value. 0 – RSRP is below the first threshold 1 – RSRP is between the first and second threshold 2 – RSPR is between the second and third threshold 3 – RSRP is between the third and fourth threshold 4 – RSRP is above the fourth threshold With default thresholds 20, 40, 60, and 80, the measured value 70 leads to index 3.


 Mobile termination control and status commands

**<rsrq>**

 0 rsrq < −19.5 dB 1 – When −19.5 dB ≤ RSRQ < −19 dB 2 – When −19 dB ≤ RSRQ < −18.5 dB ... 32 – When −4 dB ≤ RSRQ < −3.5 dB 33 – When −3.5 dB ≤ RSRQ < −3 dB 34 – When −3 dB ≤ RSRQ 255 – Not known or not detectable

**rsrq_threshold_index**

 Index of RPSQ threshold which is below the measured RSRQ value. 0 – RSRQ is below the first threshold 1 – RSRQ is between the first and second threshold 2 – RSRQ is between the second and third threshold 3 – RSRQ is between the third and fourth threshold 4 – RSRQ is above the fourth threshold With the default thresholds 7, 14, 21, and 28, the measured value 17 leads to index 2.

The following command example subscribes E-UTRA signal quality notifications:

 AT%CESQ=1 OK

The example notification indicates a change in the measured average _RSRP_. The average RSRP is 62 and mapped to threshold 3, the measured RSRQ average has been 12 and mapped to threshold index 1.

 %CESQ: 62,3,12,1

5.6.2 Read command

The read command is not supported.

5.6.3 Test command

The test command is not supported.

##### 5.7 Signal quality +CSQ

The **+CSQ** command reads 2G and 3G signal quality. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 8.5_.

5.7.1 Set command

The set command is reads 2G and 3G signal quality.


 Mobile termination control and status commands

Syntax:

 +CSQ

Response syntax:

 +CSQ: <rssi>,<ber>

 Note : Not detectable, RAT not supported. Use +CESQ and %CESQ for E-UTRA signal quality.

The set command parameters and their value are the following:

**<rssi>, <ber>**

 99 – Not detectable

The following command example reads signal quality:

 AT+CSQ +CSQ: 99,99 OK

5.7.2 Read command

The read command is not supported.

5.7.3 Test command

The test command lists supported signal quality values

Response syntax:

 +CSQ: (list of supported <rssi>s,(list of supported <ber>s)

The test command parameters and their defined values are the following:

**<rssi>, <ber>**

 99 – Not detectable

The following command example lists the supported signal quality values:

 AT+CSQ=? +CSQ: (99),(99) OK

##### 5.8 SNR signal quality notification %XSNRSQ

The Nordic-proprietary **%XSNRSQ** command subscribes notifications of changes in _Signal-to-Noise Ratio (SNR)_ signal quality. v1.0.x v1.1.x v1.2.x

 Note : When NB1 system mode is used and the device is in RRC connected state, old signal quality parameter values are reported. The values are recorded and reported from the previous idle state. v1.0.x v1.1.x v1.2.x≤1


 Mobile termination control and status commands

5.8.1 Set command

The set command subscribes notifications of changes in _SNR_ signal quality.

Syntax:

 %XSNRSQ=<n>

Notification syntax:

 %XSNRSQ: <snr>,<threshold_index>,<srxlev>,<ce_level>

The parameters and their defined values are the following:

**<n>**

 0 – Unsubscribe SNR signal quality notifications 1 – Subscribe SNR signal quality notifications

**<snr>**

 0 – SNR < −24 dB 1 – When −24 dB ≤ SNR < −23 dB 2 – When −23 dB ≤ SNR < −22 dB ... 47 – When 22 dB ≤ SNR < 23 dB 48 – When 23 dB ≤ SNR < 24 dB 49 – When 24 dB ≤ SNR 127 – Not known or not detectable

**<threshold_index>**

 The index of the SNR threshold which is below the measured SNR value. 0 – SNR is below the first threshold. 1 – SNR is between the first and second threshold. 2 – SNR is between the second and third threshold. 3 – SNR is between the third and fourth threshold. 4 – SNR is above the fourth threshold. With default thresholds 16, 24, 32, and 40, the measured value 35 leads to index 3.

**<srxlev>**

 0 – SRXLEV -127 or below -127 1...254 – SRXLEV -126...127 255 – SRXLEV above 127 32767 – Invalid or not know

**<ce_level>**

 0 – CE Level 0 1 – CE Level 1 255 – Invalid or not known


 Mobile termination control and status commands

The following command example subscribes E-UTRA signal quality notifications:

 AT%XSNRSQ=1 OK

The example notification indicates that the measured average SNR has changed to 39 and is mapped to threshold 3:

 %XSNRSQ: 39,3,130,1

5.8.2 Read command

The read command reads _SNR_ signal quality.

Response syntax:

 %XSNRSQ: <snr>,<srxlev>,<ce_level>

The read command parameter and its defined values are the following:

**<snr>**

 0 – SNR < −24 dB 1 – When −24 dB ≤ SNR < −23 dB 2 – When −23 ≤ SNR < −22 dB ... 47 – When 22 ≤ SNR < 23 dB 48 – When 23 ≤ SNR < 24 dB 49– When 24 ≤ SNR 127 – Not known or not detectable

**<srxlev>**

 0 – SRXLEV -127 or below -127 1...254 – SRXLEV -126...126 255 – SRXLEV 127 or above 32767 – Invalid or not know

**<ce_level>**

 0 – CE Level 0 1 – CE Level 1 255 – Invalid or not known

The following command example reads SNR signal quality:

 AT%XSNRSQ? %XSNRSQ: 39,168,0 OK

5.8.3 Test command

The test command is not supported.


 Mobile termination control and status commands

##### 5.9 Restricted SIM access +CRSM

The **+CRSM** command transmits restricted commands to _SIM_. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 8.18_.

5.9.1 Set command

The set command transmits restricted commands to the _SIM_.

Syntax:

 +CRSM=<command>[,<fileid>[,<P1>,<P2>,<P3>[,<data>[,<pathid>]]]]

Response syntax:

 +CRSM: <sw1>,<sw2>[,<response>]

The set command parameters and their defined values are the following:

**<command>**

 Integer. 176 – READ BINARY 178 – READ RECORD 192 – GET RESPONSE 214 – UPDATE BINARY 220 – UPDATE RECORD 242 – STATUS 203 – RETRIEVE DATA 219 – SET DATA

**<fileid>**

 Integer type. Identifier of an elementary data file on SIM. Mandatory for every command except STATUS. The range of valid file identifiers depends on the actual SIM and is defined in 3GPP TS 51.011. Optional files may not be present at all.

**<P1>, <P2>, <P3>**

 Integer type. Parameters passed on by the Mobile Termination (MT) to the SIM. These parameters are mandatory for every command, except GET RESPONSE and STATUS. The values are described in 3GPP TS 51.011.

**<data>**

 String in hexadecimal format. Information that shall be written to the SIM.

**<pathid>**

 String type. Contains the path of an elementary file on the SIM/ UICC in hexadecimal format (e.g. "7F205F70" in SIM and UICC case). The <pathid> shall only be used in the mode "select by path from MF" as defined in ETSI TS 102 221.


 Mobile termination control and status commands

**<sw1>, <sw2>**

 Integer type. Information from the SIM about command execution. These parameters are delivered to the Terminal Equipment (TE) in both cases, on successful or failed command execution.

**<response>**

 String in hexadecimal format. Issued once a command is successfully completed. STATUS and GET RESPONSE return data which provides information about the current elementary data field. This information includes file type and size (see 3GPP TS 51.011 ). After READ BINARY, READ RECORD, or RETRIEVE DATA command, the requested data will be returned. <response> is not returned after a successful UPDATE BINARY, UPDATE RECORD, or SET DATA command.

The following command example reads the forbidden _Public Land Mobile Network (PLMN)_ list:

 AT+CRSM=176,28539,0,0,12 +CRSM: 144,0,"64F01064F040FFFFFFFFFFFF" OK

5.9.2 Read command

The read command is not supported.

5.9.3 Test command

The test command is not supported.

##### 5.10 Generic SIM access +CSIM

The **+CSIM** command transmits a command to the _SIM_. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 8.17_ and _ETSI TS 102 221 Ch. 10 and 11_.

To avoid conflicts with modem firmware, **AT+CSIM** is limited so that only the following commands are allowed on a basic channel (channel 0 encoded in CLA):

- **STATUS** , with P1=”No indication”

- **MANAGE CHANNEL** , open/close logical channels

- PIN-code-related commands ( **VERIFY** , **UNBLOCK** , **ENABLE** , **DISABLE** , **CHANGE** )

- ENVELOPE, send application toolkit-specific information to _UICC_

To use other commands, use **MANAGE CHANNEL** to open a logical channel, encode the channel number in the CLA byte of the subsequent commands, and close the logical channel when SIM card access is finished.

5.10.1 Set command

The set command transmits a command to the _SIM_.

Syntax:

 +CSIM=<length>,<command>

Response syntax:

 +CSIM: <length>,<response>


 Mobile termination control and status commands

The set command parameters and their defined values are the following:

**<length>**

 Integer. The number of hexadecimal characters.

**<command>**

 The command passed to the SIM in hexadecimal format. Two characters per byte. Contains CLA, INS, P1, P2, and optionally Lc, Data, and Le bytes according to the command Application Protocol Data Unit (APDU) structure specification in ETSI TS 102 221, Ch. 10.1.

**<response>**

 The response from the SIM in hexadecimal format. Two characters per byte. Contains optional data bytes and SW1, SW2 according to the response APDU structure specification in ETSI TS 102 221, Ch. 10.2.

The following command example performs a **MANAGE CHANNEL** command to open a logical channel. The SIM card returns channel number '01' and success status '9000':

 AT+CSIM=10,"0070000001" +CSIM: 6,"019000" OK

5.10.2 Read command

The read command is not supported.

5.10.3 Test command

The test command is not supported.

##### 5.11 Device activity status +CPAS

The **+CPAS** command returns the device activity status. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 8.1_.

5.11.1 Set command

The set command returns the device activity status.

Syntax:

 +CPAS

Response syntax:

 +CPAS: <pas>

The command has the following parameter:

**<pas>**

 Activity status. 0 – Ready ( MT allows commands from Terminal Adapter (TA) / TE )


 Mobile termination control and status commands

The following command example checks the activity status:

 AT+CPAS +CPAS: 0 OK

5.11.2 Read command

The read command is not supported.

5.11.3 Test command

The test command is not supported.

##### 5.12 Indicator control +CIND

The **+CIND** command sets indicator states. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 8.9_.

5.12.1 Set command

The command sets indicator states.

Syntax:

 +CIND=[<ind>[,<ind>[,...]]]

Response syntax:

 +CIND: <descr>,<value>

The set command parameters and their defined values are the following:

**<ind>**

 Integer. 0 – Off. Other values are <descr>-specific.

 "service": 1 – On "roam": 1 On "message": 1 On

**<descr>**

 "service" – Service availability "roam" – Roaming indicator "message" – Message received

**<value>**

 Integer. Values are <descr>-specific. "service": 0 Not registered, 1 Registered "roam": 0 Not roaming, 1 Roaming "message": 1 Message received


 Mobile termination control and status commands

The example enables service and message indicators:

 AT+CIND=1,0,1 OK

The example notification indicates that the device is in service:

 +CIND: "service",1

5.12.2 Read command

The command returns indicator states.

Response syntax:

 +CIND: <ind>[,<ind>[,...]]

The command has the following parameter:

**<ind>**

 Integer. 0 – Off.

 Other values are <descr>-specific. "service": 1 – On "roam": 1 On "message": 1 On

**<descr>**

 "service" – Service availability "roam" – Roaming indicator "message" – Message received

Example:

 AT+CIND? +CIND: 1,0,1 OK

5.12.3 Test command

The command returns supported indicator states.

Response syntax:

 +CIND: (<descr>,(list of supported <ind>s))[,(<descr>,(list of supported <ind>s))[,...]]

The test command parameters and their defined values are the following:


 Mobile termination control and status commands

**<ind>**

 Integer. 0 – Off.

 Other values are <descr>-specific. "service": 1 – On "roam": 1 On "message": 1 On

**<descr>**

 "service" – Service availability "roam" – Roaming indicator "message" – Message received

Example:

 AT+CIND=? +CIND: ("service",(0,1)),("roam",(0,1)),("message",(0,1)) OK

##### 5.13 IP address format +CGPIAF

The **+CGPIAF** command returns information about IPv6 address format. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch 8.62_.

5.13.1 Set command

The set command is not supported.

5.13.2 Read command

The read command returns the IPv6 address format.

Response syntax:

 +CGPIAF: <IPv6_AddressFormat>,<IPv6_SubnetNotation>,<IPv6_LeadingZeros>,<IPv6_CompressZeros>

The read command parameters and their defined values are the following:

**<IPv6_AddressFormat>**

 1 – Use IPv6-like colon notation

**<IPv6_SubnetNotation>**

 1 – Use / (forward slash) subnet prefix Classless Inter-domain Routing (CIDR) notation

**<IPv6_LeadingZeros>**

 1 – Leading zeros are included

**<IPv6_CompressZeros>**

 0 – No zero compression


 Mobile termination control and status commands

The following command example reads the current IPv6 address format:

 AT+CGPIAF? +CGPIAF: 1,1,1,0 OK

5.13.3 Test command

The test command returns the supported IPv6 address formats.

Response syntax:

 +CGPIAF: (list of supported <IPv6_AddressFormat>s),(list of supported <IPv6_SubnetNotation>s),(list of supported <IPv6_LeadingZeros>s),(list of supported <IPv6_CompressZeros>s)

The read command parameters and their defined values are the following:

**<IPv6_AddressFormat>**

 1 – Use IPv6-like colon notation

**<IPv6_SubnetNotation>**

 1 – Use / (forward slash) subnet prefix CIDR notation

**<IPv6_LeadingZeros>**

 1 – Leading zeros are included

**<IPv6_CompressZeros>**

 0 – No zero compression

The following command example reads the current IPv6 address format:

 AT+CGPIAF=? +CGPIAF: (1),(1),(1),(0) OK

##### 5.14 Current band %XCBAND

The Nordic-proprietary **%XCBAND** command returns the current E-UTRA band. v1.0.x v1.1.x v1.2.x

5.14.1 Set command

The set command reads the current band. The command issues a valid response only when the modem is activated.

Syntax:

 %XCBAND

Response syntax:

 %XCBAND: <band>

 Note : %XBANDLOCK usage has an impact on the list of supported bands.


 Mobile termination control and status commands

The set command parameter and its defined values are the following:

**<band>**

 Integer, range 1–71. See 3GPP 36.101. 0 when current band information not available

The following command example reads the current band:

 AT%XCBAND %XCBAND: 13 OK

5.14.2 Read command

The read command is not supported.

5.14.3 Test command

The test command returns a list of supported bands.

Response syntax:

 %XCBAND: (list of supported bands <band>)

The following command example returns a list of supported bands:

 AT%XCBAND=? %XCBAND: (1,2,3,4,12,13) OK

##### 5.15 Read neighbor cells %NBRGRSRP

The Nordic-proprietary **%NBRGRSRP** command reads measured _RSRP_ values of neighboring cells. The command issues a valid response only when the modem is activated. v1.0.x v1.1.x v1.2.x

Neighboring cell measurements are valid and available only when neighbors are being monitored, which means that the strength and quality of the current cell signal do not meet the network configured level. For more information, see the requirements in _3GPP TS 36.304_.

To save energy, nRF9160 does not search and measure neighboring cells for mobility purposes if the level and quality of the serving cell signal are above the thresholds defined by the network.

5.15.1 Set command

The set command reads measured _RSRP_ values of neighboring cells.

Syntax:

 %NBRGRSRP

Response syntax:

 %NBRGRSRP: <phys_cellID>1,<EARFCN>1,<RSRP>1,<phys_cellID>2, <EARFCN>2,<RSRP>2,<phys_cellID>n, <EARFCN>n,<RSRP>n

The set command parameters and their defined values are the following:


 Mobile termination control and status commands

**<phys_cellID>**

 Integer. Physical cell ID.

**<EARFCN>**

 Integer. EARFCN for a given cell where EARFCN is according to 3GPP TS 36.101.

**<rsrp>**

 0 – RSRP < −140 dBm 1 – When −140 dBm ≤ RSRP < −139 dBm 2 – When −139 dBm ≤ RSRP < −138 dBm ... 95 – When −46 dBm ≤ RSRP < −45 dBm 96 – When −45 dBm ≤ RSRP < −44 dBm 97 – When −44 dBm ≤ RSRP 255 – Not known or not detectable

5.15.2 Read command

The read command is not supported.

5.15.3 Test command

The test command is not supported.

##### 5.16 Mode of operation (CS/PS) +CEMODE

The **+CEMODE** command sets the device mode of operation. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 10.1.28_.

5.16.1 Set command

The command sets the _CS/PS Mode of Operation_. The mode is stored in _NVM_ when the device is powered off with +CFUN=0. The command should only be used when the modem is not activated.

Syntax:

 +CEMODE=[<mode>]

The set command parameter and its defined values are the following:

**<mode>**

 0 – PS mode 2 of operation 2 – CS/PS mode 2 of operation

The following command example sets the operating mode to PS mode 2:

 AT+CEMODE=0 OK


 Mobile termination control and status commands

5.16.2 Read command

The command reads the current mode of operation.

Response syntax:

 +CEMODE: <mode>

The read command parameter and its defined values are the following:

**<mode>**

 0 – PS mode 2 of operation 2 – CS/PS mode 2 of operation

The following command example reads the current operating mode:

 +CEMODE: 0 OK

5.16.3 Test command

The test command lists the supported modes of operation.

Response syntax:

 +CEMODE: (list of supported <mode>s

The test command parameter and its defined values are the following:

**<mode>**

 0 – PS mode 2 of operation 2 – CS/PS mode 2 of operation

Example:

 +CEMODE: (0,2) OK

##### 5.17 UICC state %XSIM

The Nordic-proprietary **%XSIM** command subscribes _UICC_ state notifications. v1.0.x v1.1.x v1.2.x

5.17.1 Set command

The set command subscribes _UICC_ state notifications.

Syntax:

 %XSIM=<n>

Notification syntax:

 %XSIM: <state>

The set command parameters and their defined values are the following:


 Mobile termination control and status commands

**<n>**

 0 – Unsubscribe XSIM notifications 1 – Subscribe XSIM notifications

**<state>**

 0 – UICC not initialized 1 – UICC initialization OK

The following command example subscribes _UICC_ state notifications:

 AT%XSIM=1 OK

The following example notification indicates that _UICC_ is not initialized:

 %XSIM: 0

The following example notification indicates that _UICC_ initialization is completed:

 %XSIM: 1

5.17.2 Read command

The command reads the _UICC_ state.

Response syntax:

 %XSIM: <state>[,<cause>]

The read command parameter and its defined values are the following:

**<state>**

 0 – UICC not initialized 1 – UICC initialization OK

The following command example reads the _UICC_ state. The response indicates that _UICC_ initialization is completed:

 AT%XSIM? %XSIM: 1 OK

The following command example reads the _UICC_ state. The response indicates that a _PIN_ code is required:

 AT%XSIM? %XSIM: 0,1 OK

5.17.3 Test command

The test command is not supported.


 Mobile termination control and status commands

##### 5.18 Authenticated access %XSUDO

The Nordic-proprietary **%XSUDO** command provides authenticated access for a restricted AT command. v1.0.x v1.1.x v1.2.x

 Note : This command is for future releases. In the current software release, the use of this command is not required.

For information on the usage of the command, see Authenticating AT command usage on page 179.

5.18.1 Set command

The set command provides authenticated access for a restricted AT command.

The restricted command is separated with a semicolon (;). The leading AT prefix is not included in the concatenated command.

Syntax:

 %XSUDO=<data_len>,<signature>[,<sec_tag>]

**+CME ERROR codes**

 513 – Not found, public key not found 520 – Authentication failed

The set command parameters and their defined values are the following:

**<data_len>**

 Length of a signed command string. Only the number of characters in <data_len> from an authenticated command is processed, the rest are ignored. <data_len> shall not be greater than the given command.

**<signature>**

 Command signature in Base64 format

**<sec_tag>**

 A secure tag for multiple public keys. Integer, 0–9. Optional.

The following command example provides authenticated access for the restricted **+CMD** command:

 AT%XSUDO=28,"c2lnbmF0dXJl";+CMD=... OK

5.18.2 Read command

The read command is not supported.

5.18.3 Test command

The test command is not supported.


 Mobile termination control and status commands

##### 5.19 Public key storage management %XPMNG

The Nordic-proprietary **%XPMNG** command writes and reads the public key. The public key can be written only if it does not exist. An existing key can be deleted with the **%CMNG** command. v1.0.x v1.1.x v1.2.x

5.19.1 Set command

The set command writes and reads the public key.

Syntax:

 %XPMNG=<opcode>[,<content>[,<sec_tag>]]

Response syntax for read command:

 %XPMNG: <content>

**+CME ERROR codes**

 513 – For read: Not found 520 – For write: Already exists

The set command parameters and their defined values are the following:

**<opcode>**

 0 – Write 2 – Read

**<content>**

 String. Mandatory if parameter <opcode> is 'Write'. An empty string is not allowed. Parameter <content> is enclosed in double quotes. ASN.1 DER encoding in Base64 encoded with the header and footer of begin key and end key.

**<sec_tag>**

 A secure tag for multiple public keys. Integer, 0–9. Optional.

The following command example writes the public key:

 AT%XPMNG=0,"-----BEGIN PUBLIC KEY-----...-----END PUBLIC KEY-----" OK

The following command example reads the public key:

 AT%XPMNG=2 %XPMNG: "-----BEGIN PUBLIC KEY-----...-----END PUBLIC KEY-----" OK

5.19.2 Read command

The read command is not supported.

5.19.3 Test command

The test command is not supported.


 Mobile termination control and status commands

##### 5.20 Band lock %XBANDLOCK

The Nordic-proprietary **%XBANDLOCK** command sets locked bands. The band lock should be set before activating modem with **+CFUN**. v1.0.x v1.1.x v1.2.x

5.20.1 Set command

The command sets locked bands and bitmasks to limit supported bands.

Supported bands are masked with permanent and runtime masks. A logical AND operation is performed to **%XBANDLOCK** commands. If a permanent or runtime mask has been given, it is required that the second mask has at least one band in common with the first mask. Otherwise, the command returns ERROR. The command returns ERROR at an attempt to disable all supported bands.

 Note :

- Set band lock before activating modem with **+CFUN**.

- Permanent mask is written to flash when UE is powered down.

Syntax:

 %XBANDLOCK=<operation>[,<band_mask>]

**+CME error code**

 518 – Not allowed in active state

The set command parameters and their defined values are the following:

**<operation>**

 0 – Remove band locks 1 – Set permanent band mask 2 – Set runtime band mask

**<band_mask><permanent_lock><run-time_lock>**

 String. Bit string, LSB is band 1. Leading zeroes can be omitted. Maximum length 88 characters.

The following command example sets permanent band 4 lock:

 AT%XBANDLOCK=1,"1000" OK

The following command example sets runtime band 4 and 13 lock:

 AT%XBANDLOCK=2,"1000000001000" OK

5.20.2 Read command

The command reads locked bands.

Response syntax:

 %XBANDLOCK: <permanent_lock>,<run-time_lock>


 Mobile termination control and status commands

The read response parameter and its defined value is the following:

**<permanent_lock>,<run-time_lock>**

 Bit string, 88 bits.

An empty string is returned if bandlock is not set.

The following command example reads the locked bands. No permanent lock, runtime lock for bands 13, 4, and 1:

 AT%XBANDLOCK? %XBANDLOCK: "","0000000000000000000000000000000000000000000000000000000000000000000000000001000000001001" OK

5.20.3 Test command

The test command is not supported.

##### 5.21 Data profile %XDATAPRFL

The Nordic-proprietary **%XDATAPRFL** command can be used to provide information on the application use case to modem so that it can optimize power consumption. v1.0.x v1.1.x v1.2.x

 Note : This command is for future releases and will be extended with new parameters later. In the current software release, the use of this command has limited impact on power consumption.

5.21.1 Set command

The set command provides information on the application use case to modem. The purpose of this command is to control the power-saving parameters of the modem.

Levels 4 and 3 are meant for devices that can prioritize the time spent on finding service over power consumption. Battery-operated devices should use levels 2, 1, or 0. In the current software release, the power-saving level has an effect on _UICC_ deactivation and network search frequencies.

Syntax:

 %XDATAPRFL=<power_level>

The set command parameters and their defined values are the following:

**<power level>**

 0 – Ultra-low power 1 – Low power 2 – Normal 3 – Performance 4 – High performance

The following command example sets a low power level:

 AT%XDATAPRFL=1 OK


 Mobile termination control and status commands

5.21.2 Read command

The read command reads the application data profile.

Syntax:

 %XDATAPRFL: <power_level>

The set command parameters and their defined values are the following:

**<power level>**

 0 – Ultra-low power 1 – Low power 2 – Normal 3 – Performance 4 – High performance

The following command example reads the power level:

 AT%XDATAPRFL? AT%XDATAPRFL: 2 OK

5.21.3 Test command

The test command is not supported.

##### 5.22 Connectivity statistics %XCONNSTAT

The Nordic-proprietary **%XCONNSTAT** command sets the connectivity statistics command. v1.0.x v1.1.x v1.2.x

5.22.1 Set command

The set command sets the connectivity statistics command.

Syntax:

 %XCONNSTAT=<command>

The set command parameters and their defined values are the following:

**<command>**

 0 – Stop 1 – Start

The following command example makes the application start and stop connectivity statistics:

 AT%XCONNSTAT=1 OK AT%XCONNSTAT=0 OK


 Mobile termination control and status commands

5.22.2 Read command

The read command reads the connectivity statistics.

Syntax:

 %XCONNSTAT: <SMS Tx>,<SMS Rx>,<Data Tx>,<Data Rx>,<Packet max>,<Packet average>

The read command parameters and their defined values are the following:

**<SMS Tx>**

 Indicate the total number of SMSs successfully transmitted during the collection period.

**<SMS Rx>**

 Indicate the total number of SMSs successfully received during the collection period.

**<Data Tx>**

 Indicate the total amount of data (in kilobytes) transmitted during the collection period.

**<Data Rx>**

 Indicate the total amount of data (in kilobytes) received during the collection period.

**<Packet max>**

 The maximum packet size (in bytes) used during the collection period.

**<Packet average>**

 The average packet size (in bytes) used during the collection period.

The following command example makes the application read the connectivity statistics:

 AT%XCONNSTAT? %XCONNSTAT=2,3,45,60,708,650 OK

5.22.3 Test command

The test command is not supported.

##### 5.23 Battery voltage %XVBAT

The Nordic-proprietary **%XVBAT** command reads battery voltage. v1.0.x v1.1.x v1.2.x pti_v1.1.x≥1

When the modem is active (either LTE communication or GPS receiver), the **%XVBAT** command returns the latest voltage measured automatically during modem wakeup or reception. The voltage measured during transmission is not reported. During modem inactivity, the modem measures battery voltage when the **%XVBAT** command is received.

 Note : Longer sleeps, such as eDRX and PSM, are modem active time. Therefore, in those cases the %XVBAT value returned is from the time just before entering the sleep or from previous GPS reception during the eDRX/PSM gap.


 Mobile termination control and status commands

5.23.1 Set command

The set command reads the battery voltage in mV.

Syntax:

 %XVBAT

Response syntax:

 +XVBAT: <vbat>

The response parameter is the following:

**<vbat>**

 Integer. Battery voltage in mV, with a resolution of 4 mV.

The following command example reads the battery voltage and the response is for a successful case:

 AT%XVBAT %XVBAT: 3600 OK

5.23.2 Read command

The read command is not supported.

5.23.3 Test command

The test command is not supported.

##### 5.24 Battery voltage low level notification %XVBATLVL

The **%XVBATLVL** command subscribes unsolicited battery voltage low level notifications. v1.1.x v1.2.x

The notification is sent when the battery voltage level is under the currently set low level. The voltage is the latest voltage measured automatically during wakeup or reception.

The battery voltage low level is set using the %XVBATLOWLVL command.

5.24.1 Set command

The command subscribes unsolicited notifications of battery voltage low level.

Syntax:

 %XVBATLVL=<n>

Notification syntax:

 %XVBATLOWLVL: <battery_voltage>

The set command parameter and its defined values are the following:


 Mobile termination control and status commands

**<n>**

 0 – Unsubscribe unsolicited notifications of battery voltage low level 1 – Subscribe unsolicited notifications of battery voltage low level

The notification parameter and its defined values are the following:

**<battery_voltage>**

 Integer. Millivolts between 3000 and 5000. 0 – No valid battery voltage available

The following command example subscribes unsolicited notifications of battery voltage low level:

 AT%XVBATLVL=1 OK

The following notification example indicates that the battery voltage level is under the currently set battery voltage low level when the level has been set to 3750 mV:

 %XVBATLOWLVL: 3700

5.24.2 Read command

The read command is not supported.

5.24.3 Test command

The test command is not supported.

##### 5.25 Set battery voltage low level %XVBATLOWLVL

The **%XVBATLOWLVL** command sets the battery voltage low level for a modem. If notifications of battery voltage low level have been subscribed, the modem sends clients a notification when the measured battery voltage is below the defined level. The modem reads sensors periodically in connected mode. The default period is 60 seconds. If the temperature or voltage gets close to the set threshold, a shorter period is used. v1.1.x v1.2.x

The notifications are subscribed using the %XVBATLVL command.

5.25.1 Set command

The command sets the battery voltage low level for a modem.

Syntax:

 %XVBATLOWLVL=<battery level>

The set command parameter and its defined value is the following:

**<battery level>**

 Integer. Millivolts between 3100 and 5000. Factory default 3300.


 Mobile termination control and status commands

The following command example sets the battery voltage low level to 3500 mV:

 Set current battery voltage low level AT%XVBATLOWLVL=3500 OK

5.25.2 Read command

The command reads the battery voltage low level from a modem.

Response syntax:

 %XVBATLOWLVL?

The following command example reads the current value of the battery voltage low level:

 AT%XVBATLOWLVL? %XVBATLOWLVL: 3500 OK

5.25.3 Test command

The test command is not supported.

##### 5.26 External Power off warnings %XPOFWARN

The Nordic-proprietary **%XPOFWARN** command controls the Power off warnings from the modem. The command is supported by nRF9160-SIxA-B1. v1.1.x≥3 v1.2.x≥1

**%XPOFWARN** is based on voltage level detection without any delay. When this warning has been sent once, it needs to be enabled again by sending AT%XPOFWARN=1,<voltage>.

5.26.1 Set command

The set command configures the Power off warnings from the modem. The warning is received as an unsolicited AT indication. A hardware indication event is also sent to the application domain. When the Power off warning is sent, the modem sets itself to Offline mode and sends +CGEV: ME BATTERY LOW.

The application is responsible for detecting possible increase in the battery voltage level and for restarting the LTE protocol activities. This can be detected by issuing the **AT%XVBAT** query. If the level is acceptable again (>3000 mV), the application can proceed with **AT+CFUN=1**. For more information, see nRF9160 Product Specification.

Syntax:

 AT%XPOFWARN=<state>[,<voltage>]

The set command parameters and their defined values are the following:

**<state>**

 0 – Disable power off warnings 1 – Enable power off warnings


 Mobile termination control and status commands

**<voltage>**

 The voltage level when the Power off warning is sent. Mandatory when enabling Power off warnings. Optional when disabling Power off warnings. 30 – 3000 mV 31 – 3100 mV 32 – 3200 mV 33 – 3300 mV

The following command example enables the Power off warning in 3000 mV:

 AT%XPOFWARN=1,30 OK

5.26.2 Read command

The read command is not supported.

5.26.3 Test command

The test command is not supported.

##### 5.27 Customer production done %XPRODDONE

The Nordic-proprietary **%XPRODDONE** command shall be sent after customer production is done. v1.0.x v1.1.x v1.2.x

5.27.1 Set command

The set command disables R&D features by closing the modem _Universal Asynchronous Receiver/ Transmitter (UART)_ connection and optionally permanently disables the use of the **%XRFTEST** and **%XEMPR** commands. The command also permanently enables the downgrade prevention feature in modem firmware. Downgrade prevention cannot be disabled once it has been enabled.

Downgrade prevention means that it is not possible to flash an older firmware version to modem. Downgrade prevention applies to both FOTA and cable flash.

If the <value> parameter is not set or is 0, the **%XRFTEST** and **%XEMPR** commands are permanently disabled after the **%XPRODDONE** command has been performed. To keep the commands usable after **%XPRODDONE** , use AT%XPRODDONE=1. If commands have been disabled with **%XPRODDONE** , they cannot be re-enabled. If **%XRFTEST** is not disabled when issuing **%XPRODDONE** , it remains permanently enabled and cannot be disabled later.

Syntax:

 %XPRODDONE=[<value>]

The set command parameter and its defined values are the following:

**<value>**

 0 – Permanently disable %XRFTEST and %XEMPR 1 – Leave %XRFTEST and %XEMPR usable


 Mobile termination control and status commands

The following command example sets the customer production to done and permanently disables the **%XRFTEST** command:

 AT%XPRODDONE OK

or

 AT%XPRODDONE=0 OK

The following command example sets customer production to done and leaves **%XRFTEST** usable:

 AT%XPRODDONE=1 OK

 CAUTION: In modem firmware versions 1.0.x (x ≥ 2) and 1.1.0, downgrade prevention is enabled after the first modem flashing after issuing %XPRODDONE. In modem firmware versions 1.1.x (x ≥ 1) and 1.2.x, downgrade prevention becomes active immediately after the command is issued.

5.27.2 Read command

The read command is not supported.

5.27.3 Test command

The test command is not supported.

##### 5.28 Credential storage management %CMNG

The Nordic-proprietary **%CMNG** command is used for credential storage management. The command writes, reads, deletes, and checks the existence of keys and certificates. The credentials are stored in _NVM_. v1.0.x v1.1.x v1.2.x

5.28.1 Set command

The set command is used for credential storage management. The command writes, reads, deletes, and checks the existence of keys and certificates.

The write and delete operations are allowed only when the modem is not activated.

Syntax:

 %CMNG=<opcode>[,<sec_tag>[,<type>[,<content>[,<passwd>]]]]

Response syntax for read operation:

 %CMNG: <sec_tag>,<type>[,<sha>[,<content>]]

Response syntax for list operation:

 %CMNG: <sec_tag>,<type>[,<sha>]

<sec_tag> <type> shall be a unique pair, no multiple items with the same <sec_tag> and <type> values are allowed.


 Mobile termination control and status commands

**+CME ERROR codes**

 513 – Not found. Applies to read, write, and delete. 514 – No access. Applies to read, write, and delete. 515 – Memory full. Applies to write. 518 – Not allowed in active state

The set command parameters and their defined values are the following:

**<opcode>**

 0 – Write 1 – List 2 – Read 3 – Delete

**<sec_tag>**

 Integer, 0 – 2147483647.

 Mandatory for write, read, and delete operations. Optional for list operation.

**<type>**

 0 – Root CA certificate (ASCII text) 1 – Client certificate (ASCII text) 2 – Client private key (ASCII text) 3 – Pre-shared Key (PSK) (ASCII text in hexadecimal string format) 4 – PSK identity (ASCII text) 5 – Public Key (ASCII text) 6 – Reserved Mandatory if <opcode> is write, read, or delete. Parameter <type> with the value Public Key can only be used when parameter <opcode> is delete.

**<content>**

 String. Mandatory if <opcode> is write. An empty string is not allowed. A Privacy Enhanced Mail (PEM) file enclosed in double quotes (X.509 PEM entities). Hexadecimal data in ASCII string format containing two International Reference Alphabet (IRA) characters per octet ( PSK ).

**<passwd>**

 String. PKCS#8 password. Mandatory for writing a type 2 encrypted private key, ignored for other types. Maximum length 32 characters.

**<sha>**

 String. SHA-256 digest of the entity (DER, PEM) as stored in the filesystem, 64 hexadecimal characters (representing a 256 bit vector).

 Note :

- <content> in the read response is exactly what is written, including <CR>, <LF>, and other     characters. The characters outside the double quotes are part of the AT response format.

- Reading types 1, 2, and 3 are not supported.


 Mobile termination control and status commands

The following command example writes the root certificate:

 AT%CMNG=0, 12345678, 0," -----BEGIN CERTIFICATE----MIIDSjCCA... ...bKbYK7p2CNTUQ -----END CERTIFICATE-----” OK

The following command example writes the client certificate:

 AT%CMNG=0,567890,1," -----BEGIN CERTIFICATE----MIIBc464... ...bW9aAa4 -----END CERTIFICATE-----” OK

The following command example writes the private key:

 AT%CMNG=0,123,2," -----BEGIN ENCRYPTED PRIVATE KEY----MIICz... ...ukBu -----END ENCRYPTED PRIVATE KEY-----”, ”abcdefg” OK

The following command example lists a single item by specifying tag and type:

 AT%CMNG=1,12345678, 0 %CMNG: 12345678, 0, "978C...02C4" OK

The following command example lists a single tag:

 AT%CMNG=1,12345678 %CMNG: 12345678, 0, "978C...02C4" %CMNG: 12345678, 1, "1A8C...02BB" OK

The following command example lists all stored credentials:

 AT%CMNG=1 %CMNG: 12345678, 0, "978C...02C4" %CMNG: 567890, 1, "C485...CF09" %CMNG: 123, 2, "92E1...8AC8" %CMNG: 654321, 3, "E0C9...511D" OK


 Mobile termination control and status commands

The following command example reads the root certificate with tag 12345678:

 AT%CMNG=2, 12345678, 0 %CMNG: 12345678, 0, "978C...02C4", "-----BEGIN CERTIFICATE----MIIBc464... ...bW9aAa4 -----END CERTIFICATE-----" OK

The following command example deletes a client certificate with tag 123:

 AT%CMNG=3,123,1 OK

The following command example reads a non-existing root certificate with tag 4567. Error code 513 is returned:

 AT%CMNG=2,4567,0 +CME ERROR: 513

5.28.2 Read command

The read command is not supported.

5.28.3 Test command

The test command is not supported.

##### 5.29 Internal temperature %XTEMP

The Nordic proprietary **%XTEMP** command subscribes unsolicited internal temperature notifications. The modem reads sensors periodically in connected mode. The default period is 60 seconds. If the temperature or voltage gets close to the set threshold, a shorter period is used. v1.0.x v1.1.x v1.2.x

5.29.1 Set command

The set command subscribes or unsubscribes unsolicited internal temperature notifications.

A notification is sent when the temperature is rising above a high or critical temperature level or cooling down from a critical or high temperature level.

Syntax:

 %XTEMP=<n>

Notification syntax:

 %XTEMP: <temperature_level>,<temperature>

The set command parameters and their defined values are the following:

**<n>**

 0 – Unsubscribe unsolicited temperature indications 1 – Subscribe unsolicited temperature indications


 Mobile termination control and status commands

The notification parameters and their defined values are the following:

**<temperature_level>**

 1 – Normal temperature 2 – High temperature. Factory default 55. This can be changed with High level for internal temperature %XTEMPHIGHLVL on page 59. 3 – Critical temperature. TX/RX disabled. Factory default 90.

**<temperature>**

 Integer. Celsius degrees between −40 and 125.

The following command example subscribes notifications:

 AT%XTEMP=1 OK

The example shows an unsolicited notification for an internal temperature level:

 %XTEMP: 1,37 %XTEMP: 2,56 %XTEMP: 3,91

5.29.2 Read command

The read command reads the internal temperature level and the temperature.

Syntax:

 %XTEMP?

Response syntax:

 %XTEMP: <temperature>

The following command example reads the current modem temperature:

 AT%XTEMP? %XTEMP: 50 OK

5.29.3 Test command

The test command is not supported.

##### 5.30 High level for internal temperature

##### %XTEMPHIGHLVL

The Nordic proprietary **%XTEMPHIGHLVL** command sets the high level to internal temperature in the modem. v1.0.x v1.1.x v1.2.x

5.30.1 Set command

The set command sets the high internal temperature level for the notification in the %XTEMP AT command.


 Mobile termination control and status commands

When the high temperature level is reached, data transmission should be controlled and minimized to prevent modem overheating.

Syntax:

 %XTEMPHIGHLVL=<temperature>

The set command parameters and their defined values are the following:

**<temperature>**

 Integer. Celsius degrees between 1 and 85. Factory default 55.

The following command example sets the high temperature level:

 AT%XTEMPHIGHLVL=60 OK

5.30.2 Read command

The read command reads the internal high temperature level of a modem.

When a high temperature level is reached, data transmission should be controlled and minimized to prevent modem overheating.

Syntax:

 %XTEMPHIGHLVL?

The following command example reads the current internal high temperature level:

 AT%XTEMPHIGHLVL? %XTEMPHIGHLVL: 60 OK

5.30.3 Test command

The test command is not supported.

##### 5.31 Clock +CCLK

The **+CCLK** command sets the clock of the device. v1.0.x v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 8.15_.

5.31.1 Set command

The set command sets the real-time clock of the _UE_.

Syntax:

 +CCLK=<time>

The set command parameters and their defined values are the following:


 Mobile termination control and status commands

**<time>**

 String. Current time in the format "yy/MM/dd,hh:mm:ss±zz", where the characters, from left to right, indicate year, month, day, hour, minutes, seconds, and time zone. Time zone indicates the difference, expressed in quarters of an hour, between the local time and GMT (value range −48...+48).

The following command example sets the real-time clock:

 AT+CCLK="18/12/06,22:10:00+08" OK

5.31.2 Read command

The read command reads the real-time clock.

Response syntax:

 +CCLK: <time>

If time is not received or set with the **+CCLK** command, the response is ERROR.

 Note : The device clock updates are based on network time when available. The time can be requested using the read command, but not all networks provide the information, nor can the highest accuracy requirements be guaranteed, either.

The read response parameters and their defined values are the following:

**<time>**

 String. Current time in the format "yy/MM/dd,hh:mm:ss±zz", where the characters, from left to right, indicate year, month, day, hour, minutes, seconds, and time zone. Time zone indicates the difference, expressed in quarters of an hour, between the local time and GMT (value range −48...+48).

The following command example reads the real-time clock:

 AT+CCLK? +CCLK: "18/12/06,22:10:00+08" OK

5.31.3 Test command

The test command is not supported.

##### 5.32 Proprietary clock %CCLK

The **%CCLK** command sets the real-time clock of the device. v1.1.x v1.2.x

For reference, see _3GPP 27.007 Ch. 8.15_.

5.32.1 Set command

The set command sets the current time and daylight saving time of the _UE_.


 Mobile termination control and status commands

Syntax:

 %CCLK=<time>,<daylight_saving_time>

The set command parameters and their defined values are the following:

**<time>**

 String. Current time in the format "yy/MM/dd,hh:mm:ss±zz", where the characters, from left to right, indicate year, month, day, hour, minutes, seconds, and time zone. Time zone indicates the difference, expressed in quarters of an hour, between the local time and GMT (value range −48...+48 and 99 for "not set" or "unknown").

**<daylight_saving_time>**

 0 – No adjustment of daylight saving time 1 – +1 hour adjustment of daylight saving time 2 – +2 hours adjustment of daylight saving time

The following command example sets the real-time clock:

 AT%CCLK="02/05/07,14:08:17+00",2 OK

5.32.2 Read command

The read command reads the current time and daylight saving time.

Response syntax:

 %CCLK: <time>[,<daylight_saving_time>]

If time is not received or set with the **%CCLK** command, the response is ERROR.

 Note : The device clock updates are based on network time when available. The time can be requested using the read command, but not all networks provide the information, nor can the highest accuracy requirements be guaranteed, either.

The read command parameters and their defined values are the following:

**<time>**

 String. Current time in the format "yy/MM/dd,hh:mm:ss±zz", where the characters, from left to right, indicate year, month, day, hour, minutes, seconds, and time zone. Time zone indicates the difference, expressed in quarters of an hour, between the local time and GMT (value range −48...+48).

**<daylight_saving_time>**

 Optional. Present if received from the network or if the user has set it in AT%CCLK. 0 – No adjustment of daylight saving time 1 – +1 hour adjustment of daylight saving time 2 – +2 hours adjustment of daylight saving time


 Mobile termination control and status commands

The following command example reads the current date, time, and daylight saving time:

 AT%CCLK? %CCLK: "02/05/07,14:08:17+00",2 OK

5.32.3 Test command

The test command is not supported.

##### 5.33 Modem trace activation %XMODEMTRACE

The Nordic-proprietary **%XMODEMTRACE** command activates modem traces. The trace data is in binary format and can help the Nordic customer support to analyze and resolve issues. v1.0.x v1.1.x v1.2.x pti_v1.1.x≥1

Traces can be captured using Trace Collector in the nRF Connect toolset.

The configuration is stored in _NVM_ when the device is powered off with +CFUN=0.

5.33.1 Set command

The set command activates and deactivates modem trace.

Syntax:

 %XMODEMTRACE=<oper>[,<set_id>[,<bitmap_id>,<bitmap>]]

Response syntax for Read trace bitmap:

 %XMODEMTRACE: <bitmap>

The set command parameters and their defined values are the following:

**<oper>**

 Operation 0 – Deactivate traces 1 – Activate predefined trace set 2 – Activate trace bitmap. To be used only on request by Nordic customer support. 3 – Read trace bitmap. To be used only on request by Nordic customer support.

**<set_id>**

 Integer, predefined trace set identifier 1 – Coredump only 2 – Generic 3 – LWM2M 4 – IP only 5 – LWM2M_Generic

**<bitmap_id>**

 Integer, trace bitmap identifier. Used only with the assistance of Nordic customer support.


 Mobile termination control and status commands

**<bitmap>**

 String, hexadecimal data represented with an IRA string. Used only with the assistance of Nordic customer support.

The following command example activates trace set 1 (Coredump only):

 AT%XMODEMTRACE=1,1 OK

The following command example deactivates trace:

 AT%XMODEMTRACE=0 OK

5.33.2 Read command

The read command is not supported.

5.33.3 Test command

The test command is not supported.

##### 5.34 Personalization of modem %XUSIMLCK

The Nordic-proprietary **%XUSIMLCK** command allows personalizing the modem to work with predefined USIM cards. v1.1.x v1.2.x

5.34.1 Set command

The set command allows locking the modem to work with predefined USIM cards. Using the command, the modem can be personalized, depersonalized, or the lock of a category can be disabled if the category is not depersonalized.

It is also possible to configure USIM personalization so that the device is locked to the first USIM that is inserted to it.

According to _3GPP TS 22.022_ , the following personalization options are available:

- Network

- Network subset

- Service provider

- Corporate

- USIM

Syntax:

 %XUSIMLCK=<command>,<facility>,[<pwd>,[<permanent>,[<pers_data>]]]

The modem supports a maximum of 24 personalization codes.

The set command parameters and their defined values are the following:


 Mobile termination control and status commands

**<command>**

 1 – Personalize 2 – Depersonalize 3 – Disable 4 – Lock device to the first inserted USIM. The value of <facility> must be PS.

**<facility>**

 String: PN – Network personalization PU – Network subset personalization PP – Service provider personalization PC – Corporate personalization PS – USIM personalization

**<pwd>**

 String. A password for enabling or disabling personalization. Used for <command> values 1, 2, or 4. The length of the password is 6–16 digits. If PN Network Control Key, (NCK) If PU Network Subset Control Key, (NSCK) If PP Service Provider Control Key, (SPCK) If PC Corporate Control Key, (CCK) If PS Personalization Control Key, (PCK)

**<permanent>**

 Programmable selection of the Control Key. Used only when the value of <command> is 1. The permanent Control Key can be programmed once, and it is therefore immutable once programmed. 0 – Nonpermanent Control Key 1 – Permanent Control Key


 Mobile termination control and status commands

**<pers_data>**

 String. Used only when the value of <command> is 1. When <facility> is PN, <pers_data> can contain a maximum of 24 pairs of MCC and MNC in the following format: MCC1.MNC1:MCC2.MNC2:...:MCCn.MNCn. When <facility> is PU, <pers_data> can contain a maximum of 24 pairs of MCC +MNC+Network Subset Code (digits 6 and 7 of IMSI) in the following format: MCC1.MNC1.D61.D71:MCC2.MNC2.D62.D72:...:MCCn.MNCn.D6n.D7n, where D6x and D7x represent the sixth and seventh digits of IMSI. When <facility> is PP, <pers_data> can contain a maximum of 24 USIM group identifiers for service provider personalization in the following format: MCC1.MNC1.GID11:MCC2.MNC2.GID12:...:MCCn.MNCn.GID1n. GID1x represents the first byte of EF_GID1 in USIM, see 3GPP TS 31.102 chapter 4.2.10 EFGID1. When <facility> is PC, <pers_data> can contain a maximum of 24 pairs of USIM group identifiers from EFGID1 and 4.2.11 EFGID2 for corporate personalization in the following format: MCC1.MNC1.GID11.GID21:MCC2.MNC2.GID12.GID22:...: MCCn.MNCn.GID1n.GID2n.

 GID1x and GID2x represent the first bytes of EF_GID1 and EF_GID2, see 3GPP TS 31.102 chapters 4.2.10 EFGID1 and 4.2.11 EFGID2. When <facility> is PS, <pers_data> can contain a maximum of 24 IMSIs as specified in 3GPP TS 31.102 chapter 4.2.2 EFIMSI. Fifteen IMSI digits can be given. The format is the following: IMSI1:IMSI2:...:IMSIn. .

The following command example creates a nonpermanent network personalization:

 AT%XUSIMLCK=1,"PN","12345678",0,"100.200" OK

The following command depersonalizes the network personalization:

 AT%XUSIMLCK=2,"PN","12345678" OK

This command disables network personalization:

 AT%XUSIMLCK=3,"PN" OK

This command locks device to the first inserted USIM in a nonpermanent manner:

 AT%XUSIMLCK=4,"PS","12345678",0 OK

This command personalizes USIM to IMSI 100200777777777 (MCC=100, MNC=200, other digits are 7). The facility PS is permanently locked to password "12345678". After depersonalization, no other keys can be used for this facility:

 AT%XUSIMLCK=1,"PS","12345678",1,"100200777777777" OK


 Mobile termination control and status commands

5.34.2 Read command

The read command is not supported.

5.34.3 Test command

The test command is not supported.

##### 5.35 Fallback to SMS only %XSMSFALLBACK

The Nordic-proprietary **%XSMSFALLBACK** command sets the SMS only fallback functionality. With SMS only fallback, _UE_ triggers a _Tracking Area Update (TAU)_ request for SMS only immediately when CS service registration fails with permanent cause. This ensures that SMS services are available as soon as possible after registration. SMS only and SMS only fallback are available only in NB. v1.0.x v1.1.x v1.2.x

5.35.1 Set command

The set command enables and disables immediate SMS-only fallback in NB-IoT if CS services are permanently unavailable via combined procedures.

Syntax:

 %XSMSFALLBACK=<fallback_status>

The set command parameters and their defined values are the following:

**<fallback_status>**

 0 – Fallback is not performed 1 – Fallback is performed

The following command example sets SMS fallback in NB-IoT:

 AT%XSMSFALLBACK=1 OK

5.35.2 Read command

The read command is not supported.

5.35.3 Test command

The test command is not supported.

##### 5.36 System mode %XSYSTEMMODE

The Nordic-proprietary **%XSYSTEMMODE** command sets the modem system mode. v1.0.x v1.1.x v1.2.x pti_v1.1.x≥1

The configuration is stored in _NVM_ when the device is powered off with +CFUN=0.

5.36.1 Set command

The set command sets the supported system modes of the modem.


 Mobile termination control and status commands

 Note : Only one supported LTE mode allowed at a time. This command is allowed only before activating the modem using the CFUN=1 command. If the mode needs to be changed,the modem must first be set to flight mode using the CFUN=4 command.

Syntax:

 %XSYSTEMMODE=<M1_support>,<NB1_support>,<GNSS_support>,<LTE_preference>

**+CME error codes**

 518 – Not allowed in active state 522 – Band configuration not valid for selected mode

The set command parameters and their defined values are the following:

**<M1_support>**

 0 – LTE Cat-M1 not supported 1 – LTE Cat-M1 supported

**<NB1_support>**

 0 – LTE Cat-NB1 not supported 1 – LTE Cat-NB1 supported

**<GNSS_support>**

 0 – GNSS not supported 1 – GNSS supported

**<LTE_preference>**

 <LTE preference> is for the coming releases. Not relevant in the current release. 0 – No preference 1 – LTE Cat-M1 preferred 2 – LTE Cat-NB1 preferred

The following command example sets LTE Cat-M1 and GNSS as the system modes. No preferred LTE mode set:

 AT%XSYSTEMMODE=1,0,1,0 OK

5.36.2 Read command

The read command reads the supported modem system modes.

Response syntax:

 %XSYSTEMMODE: <M1_support>,<NB1_support>,<GNSS_support>,<LTE_preference>

The read response parameters and their defined values are the following:

**<M1_support>**

 0 – LTE Cat-M1 not supported 1 – LTE Cat-M1 supported


 Mobile termination control and status commands

**<NB1_support>**

 0 – LTE Cat-NB1 not supported 1 – LTE Cat-NB1 supported

**<GNSS_support>**

 0 – GNSS not supported 1 – GNSS supported

**<LTE_preference>**

 <LTE preference> is for the coming releases. Not relevant in the current release. 0 – No preference 1 – LTE Cat-M1 preferred 2 – LTE Cat-NB1 preferred

The following command example reads the supported system mode:

 AT%XSYSTEMMODE? %XSYSTEMMODE: 1,0,0,0 OK

5.36.3 Test command

The test command is not supported.

##### 5.37 PTW setting %XPTW

The Nordic-proprietary **%XPTW** command sets the _Paging Time Window (PTW)_. v1.0.x v1.1.x v1.2.x

5.37.1 Set command

The set command sets the requested _Paging Time Window (PTW)_ parameters.

 Note : Use the command with caution. The requested values must be compliant with the eDRX cycle values configured using the +CEDRXS command. The modem will use the configured value in eDRX cycle/PTW length negotiation with the network when eDRX is enabled using the +CEDRXS command.

When eDRX parameters are changed using the **+CEDRXS** command, the PTW value is set as default. If other than the default PTW has to be used, the **%XPTW** command shall be sent after the **+CEDRXS** command. See eDRX setting +CEDRXS on page 119.

Syntax:

 %XPTW=<AcT-type>[,<Requested_ptw_value>]

The set command parameters and their defined values are the following:

**<AcT-type>**

 4 – E-UTRAN (WB-S1 mode) 5 – E-UTRAN (NB-S1 mode)


 Mobile termination control and status commands

**<Requested_ptw_value>**

 String. Half a byte in a 4-bit format. The PTW value refers to bits from 8 to 5 of octet 3 of the Extended Discontinuous Reception (eDRX) parameters information element (see subclause 10.5.5.32 of 3GPP TS 24.008 ). Optional. If not present, the value of the requested AcT-type is reset to the manufacturer-specific default.

 LTE Cat M1 mode Bit 4 3 2 1 – Paging Time Window length 0 0 0 0 – 1.28 seconds

 0 0 0 1 – 2.56 seconds 0 0 1 0 – 3.84 seconds 0 0 1 1 – 5.12 seconds

 0 1 0 0 – 6.4 seconds 0 1 0 1 – 7.68 seconds 0 1 1 0 – 8.96 seconds

 0 1 1 1 – 10.24 seconds 1 0 0 0 – 11.52 seconds 1 0 0 1 – 12.8 seconds 1 0 1 0 – 14.08 seconds

 1 0 1 1 – 15.36 seconds 1 1 0 0 – 16.64 seconds 1 1 0 1 – 17.92 seconds

 1 1 1 0 – 19.20 seconds 1 1 1 1 – 20.48 seconds LTE Cat NB1 mode

 Bit 4 3 2 1 – Paging Time Window length 0 0 0 0 – 2.56 seconds 0 0 0 1 – 5.12 seconds

 0 0 1 0 – 7.68 seconds 0 0 1 1 – 10.24 seconds 0 1 0 0 – 12.8 seconds

 0 1 0 1 – 15.36 seconds 0 1 1 0 – 17.92 seconds 0 1 1 1 – 20.48 seconds

 1 0 0 0 – 23.04 seconds 1 0 0 1 – 25.6 seconds


 Mobile termination control and status commands

 1 0 1 0 – 28.16 seconds 1 0 1 1 – 30.72 seconds

 1 1 0 0 – 33.28 seconds 1 1 0 1 – 35.84 seconds 1 1 1 0 – 38.4 seconds

 1 1 1 1 – 40.96 seconds

The following command example sets the requested PTW value:

 AT%XPTW=4,"1000" OK

5.37.2 Read command

The read command reads the requested _Paging Time Window (PTW)_ parameters.

Response syntax:

 %XPTW: <AcT-type>,<Requested_ptw_value>

The read response parameters and their defined values are the following:

**<AcT-type>**

 4 – E-UTRAN (WB-S1 mode) 5 – E-UTRAN (NB-S1 mode)

**<Requested_ptw_value>**

 String. Half a byte in a 4-bit format. The PTW value refers to bits from 8 to 5 of octet 3 of the eDRX parameters information element (see subclause 10.5.5.32 of 3GPP TS 24.008 ).

The following command example reads the requested PTW value(s):

 AT%XPTW? %XPTW: 4,"0110" %XPTW: 5,"1110" OK

 Note :

- If the device supports many access technologies, each access technology is included in a     separate line as illustrated in the example above.

- The negotiated PTW value can be checked with the **+CEDRXRDP** command.

5.37.3 Test command

The test command is not supported.


 Mobile termination control and status commands

##### 5.38 Extra maximum TX power reduction %XEMPR

The Nordic-proprietary **%XEMPR** command allows to configure an extra reduction of 0.5 or 1 dB to the maximum transmission power on all or selected supported 3GPP bands separately in the NB1 and M1 modes. v1.2.x pti_v1.1.x≥1

 Note : The use of this command can be permanently prevented with the AT%XPRODDONE command.

5.38.1 Set command

The set command sets the extra maximum TX power reduction.

The command can be given separately to the NB1 and M1 modes. If a band is not mentioned in the command, the EMPR is zero for that band. The command cannot be used to increase transmission power. **%XEMPR** should be given before the activation of the modem to be effective. It can also be stored to nRF9160's memory using AT+CFUN=0 or AT%XFSSYNC when using PTI. If a valid EMPR configuration exists, the reduction is automatically applied to the applicable transmissions.

Syntax:

 AT%XEMPR=<nb1_or_m1_mode>,<k>,<band0>,<pr0>,<band1>,<pr1>,...,<bandk-1>,<prk-1>

or

 AT%XEMPR=<nb1_or_m1_mode>, 0, <pr_for_all_bands>

The set command parameters and their defined values are the following:

**<nb1_or_m1_mode>**

 0 – NB1 1 – M1

**<k>**

 The number of bands to which EMPR is set. If <k> is 0, the next parameter <pr_for_all_bands> is applied to all supported 3GPP bands. The %XEMPR command supports listing the power reduction for all the supported bands of nRF9160 in one command for both NB1 and M1.

**<bandn>**

 The number of the 3GPP band to which the following <prn> is applied.

**<prn>**

 EMPR for <bandn> 0 – 0 dB 1 – Maximum power reduced 0.5 dB 2 – Maximum power reduced 1.0 dB > 2 is not allowed

The following command example reduces the maximum TX power on all bands in the NB1 mode by 1 dB:

 AT%XEMPR=0,0,2 OK


 Mobile termination control and status commands

The following command example reduces the maximum TX power on three (<k>=3) bands in the M1 mode (<nb1_or_m1_mode>=1). The maximum TX power is reduced by 1 dB on bands 5 and 8 and by 0.5 dB on band 13:

 AT%XEMPR=1,3,5,2,8,2,13,1 OK

The following command example deletes the existing configuration by sending the command without any parameters:

 AT%XEMPR OK

5.38.2 Read command

The read command reads the currently active configuration.

Syntax:

 AT%XEMPR?

The following command example reads the currently active configuration after both examples of the set command have been given:

 AT%XEMPR? %XEMPR: 0,0,2 1,3,5,2,8,2,13,1 OK

5.38.3 Test command

The test command is not supported.

##### 5.39 Write content to file %XFILEWRITE

The Nordic-proprietary **%XFILEWRITE** command writes given content to a file. v1.2.x pti_v1.1.x≥1

5.39.1 Set command

The set command requests to write content to a file.

Syntax:

 %XFILEWRITE=<file>,<content>[,<checksum>]

The set command parameters and their defined values are the following:

**<file>**

 1 – GNSS almanac

**<content>**

 Hexadecimal numbers containing two IRA characters per octet.


 Mobile termination control and status commands

**<checksum>**

 Checksum of the content calculated over the sha256 algorithm. Mandatory for GNSS almanac file.

The following command example requests to write the _GNSS_ almanac to a file:

 AT%XFILEWRITE=1, “f0ea0200312a080000000031...”,”bf38c845eab79f459f7b3ef4393f1a2860d309952832a0073b990f12a7274e64” OK

5.39.2 Read command

The read command is not supported.

5.39.3 Test command

The test command is not supported.

##### 5.40 Coverage enhancement mode information

##### +CEINFO

The **+CEINFO** command subcribes Coverage Enhancement (CE) notifications. v1.2.x

5.40.1 Set command

The set command subscribes Coverage Enhancement (CE) notifications and reads current parameters.

Syntax:

 +CEINFO=<Reporting>

Notification syntax:

 +CEINFO: <Reporting>,<CE Enabled>,<UE State>,<Downlink Repetition Factor>,<Uplink Repetition Factor>,<RSRP>,<CINR>

<UE State> is not between double quotation marks.

The set command parameters and their defined values are the following:

**<reporting>**

 0 – Disable unsolicited notifications 1 – Enable unsolicited notifications

**<CE Enabled>**

 0 – Serving cell does not support CE mode A/B 1 – Serving cell supports CE mode A/B

(^3) The value corresponds to the last value that has been stored before the time of report. For example, when releasing an RRC connection, the transition from connection to idle state and the next <UE State> being stored and reported can take several seconds.


 Mobile termination control and status commands

**<UE State>**

 UE state at the time of the report.^3 I – Idle R – RACH C – Connected

**<Downlink Repetition Factor>**

 Downlink repetition factor. If <UE state> is Idle or RACH, it is set to mpdcch-NumRepetition according to the current radio condition (i.e. RSRP) and prach-ParametersListCE-r13 in SIB2 if the access technology is LTE-M. It is set to npdcch-NumRepetitions according to the current radio condition and NPRACH-Parameters-NB-r13 in SIB2-NB if the access technology is NB-IoT. If <UE state> is Connected, it is set to mpdcch-NumRepetition for the radio bearer if the access technology is LTE-M. It is set to npdcch-NumRepetitions for the radio bearer if the access technology is NB-IoT.

**<Uplink Repetition Factor>**

 Uplink repetition factor. If <UE state> is Idle, it is set to numRepetitionPerPreambleAttempt accordig to the current radio condition. If <UE state> is RACH, it is set to numRepetitionPerPreambleAttempt selected by UE. If <UE state> is Connected, it is set to repetition number for PUSCH if the access technology is LTE-M. It is set to repetition number for NPUSCH if the access technology is NB-IoT.

**<RSRP>**

 Current RSRP level at the time of report.^3 Numerical range in dBm. 255 – Not known or not detectable.

**<CINR>**

 Current CINR level at the time of report^3. Numerical range in dBm. 127 – Not known or not detectable.

The following command example subscribes unsolicited CE notifications:

 AT+CEINFO=1 OK

The following is an example of an unsolicited CE notification:

 +CEINFO: 1,1,C,5,3,-50,10

5.40.2 Read command

The command requests Coverage Enhancement (CE) mode information.


 Mobile termination control and status commands

Response syntax:

 +CEINFO: <Reporting>,<CE Enabled>,<UE State>,<Downlink Repetition Factor>,<Uplink Repetition Factor>,<RSRP>,<CINR>

The following command example reads CE mode information:

 AT+CEINFO? +CEINFO: 1,1,C,5,3,-50,10 OK

5.40.3 Test command

The test command is not supported.
*/
