/* eslint-disable max-classes-per-file */

/* General
 *
 * The general commands are for the identification of the device.
 */

import { ATCommand } from './at_command';

// 4.1
export class AT_CGMI extends ATCommand {
    /*! Request manufacturer identification */
    constructor() {
        super('+CGMI');
    }
    set() {
        /*!
The set command requests manufacturer identification.

Syntax:

    +CGMI

Response syntax:

    <manufacturer>

The <manufacturer> parameter returns a string of up to 2048 characters followed by `<CR><LF>`.
The following command example reads the manufacturer ID:

    AT+CGMI
    Nordic Semiconductor ASA
    OK
*/
        return {
            command: this.command,
            parser(input) {
                return input;
            },
        };
    }
}

// 4.2
export class AT_CGMM extends ATCommand {
    /*! Request model identification */
    constructor() {
        super('+CGMM');
    }
    set() {
        /*!
The set command requests System in Package (SiP) model identification.

Syntax:

    +CGMM

Response syntax:

    <model>

The <model> parameter returns a string of up to 2048 characters followed by `<CR><LF>OK`.
The following command example reads the model ID:

    AT+CGMM
    nRF9160-SICA
    OK
*/
        return {
            command: this.command,
            parser(input) {
                return input;
            },
        };
    }
}

// 4.3
export class AT_CGMR extends ATCommand {
    /*! Request revision identification */
    constructor() {
        super('+CGMR');
    }
    set() {
        /*!
The set command requests modem firmware revision identification.

Syntax:

    +CGMR

Response syntax:

    <revision>

The <revision> parameter returns a string of up to 2048 characters followed by <CR><LF>OK.
The following command example reads the revision ID:

    AT+CGMR
    mfw_nrf9160_1.1.1
    OK
*/
        return {
            command: this.command,
            parser(input) {
                return input;
            },
        };
    }
}

// 4.4
export class AT_CGSN extends ATCommand {
    /*! Request product serial number identification */
    constructor() {
        super('+CGSN');
    }
    set(snt = 0) {
        /*!
The set command requests product serial number identification.

Syntax:

    +CGSN[= <snt>]

The set command parameters and their defined values are the following:

**<snt>**
    0 – Respond with <sn> (default)
    1 – Respond with +CGSN: <imei>
    2 – Respond with +CGSN: <imeisv>
    3 – Respond with +CGSN: <svn>

**<sn>**
Information text determined by the manufacturer. Up to 2048 characters.
Electronic Serial Number (ESN) returned if available. International Mobile (Station)
Equipment Identity (IMEI) returned if ESN not available.

**<imei>**
A string in decimal format indicating the IMEI. Composed of Type Allocation Code
(TAC) (8 digits), Serial Number (SNR) (6 digits), and Check Digit (CD) (1 digit).

**<imeisv>**
A string in decimal format indicating the International Mobile (Station) Equipment
Identity, Software Version (IMEISV). The 16 digits of IMEISV are composed of TAC
(8 digits), SNR (6 digits), and Software Version Number (SVN) (2 digits).

**<svn>**
A string in decimal format indicating the current SVN which is part of IMEISV.

Response syntax when <snt>=0 (or omitted):

    <sn>

Response syntax for other <snt> values:

    +CGSN: <string>

where <string> can be <imei>, <imeisv>, or <svn>.

The following command example reads the serial number:

    AT+CGSN
    352656100367872
    OK

The following command example reads the IMEI:

    AT+CGSN=1
    +CGSN: "352656100367872"
    OK
*/
        const id = ['sn', 'imei', 'imeisv', 'svn'][snt];
        return {
            command: `AT${this.command}=${snt}`,
            parser(input) {
                const match = /\+CGSN: "(?<id>.*?)"/.exec(input)[0];
                return {
                    [id]: match.id,
                };
            },
        };
    }

    test() {
        /*!
The test command returns a list of supported <snt> values.

Response syntax:

    +CGSN: (list of supported <snt>s)

The test command parameter and its defined values are the following:

**<snt>**
    0 – Respond with <sn> (default)
    1 – Respond with +CGSN: <imei>
    2 – Respond with +CGSN: <imeisv>
    3 – Respond with +CGSN: <svn>

Example:

    AT+CGSN=?
    +CGSN: (0-3)
    OK
*/
        return {
            command: `AT${this.command}=?`,
            parser(input) {
                const match = /\+CGSN: "(?<id_list>.*?)"/.exec(input)[0];
                return {
                    id_list: match.id_list,
                };
            },
        };
    }
}

// 4.5
export class AT_CIMI extends ATCommand {
    /*! Request IMSI

The **+CIMI** command reads the _International Mobile Subscriber Identity (IMSI)_
from the _Universal Subscriber Identity Module (USIM)_ card.
    */
    constructor() {
        super('+CIMI');
    }
    set() {
        /*!
The set command reads the _IMSI_ from the _Subscriber Identity Module (SIM)_ card.

Syntax:

    +CIMI

Response syntax:

    <IMSI>

The response parameter and its defined value is the following:

**<IMSI>**
IMSI, a string without double quotes

Note: ERROR is returned if IMSI is not available.

The following command example reads the IMSI string:

    AT+CIMI
    284011234567890
    OK
*/
        return {
            command: `AT${this.command}`,
            parser(input) {
                return input;
            },
        };
    }
}

// 4.6
export class AT_SHORTSWVER extends ATCommand {
    /*! Short software identification

The Nordic-proprietary **%SHORTSWVER** command requests short software identification.
    */
    constructor() {
        super('%SHORTSWVER');
    }
    set() {
        /*!
The set command requests short software identification.

Syntax:

    %SHORTSWVER

Response syntax:

    %SHORTSWVER: <version_string>

The response parameter and its defined value is the following:

**<version_string>**
A string without double quotes

The following command example requests short software identification:

    AT%SHORTSWVER
    %SHORTSWVER: nrf9160_1.1.2
    OK
*/
        return {
            command: `AT${this.command}`,
            parser(input) {
                return /%SHORTSWVER: (?<version_string>.*)/.exec(input)[0];
            },
        };
    }
}

// 4.7
export class AT_HWVERSION extends ATCommand {
    /*! Hardware identification

The Nordic-proprietary **%HWVERSION** command requests hardware identification.
    */
    constructor() {
        super('%HWVERSION');
    }
    set() {
        /*!
The set command requests hardware identification.

Syntax:

    %HWVERSION

Response syntax:

    %HWVERSION: <version_string>

The response parameter and its defined value is the following:

**<version_string>**
A string without double quotes

The following command example requests hardware identification:

    AT%HWVERSION
    %HWVERSION: nRF9160 SICA B0A
    OK
*/
        return {
            command: `AT${this.command}`,
            parser(input) {
                return /%HWVERSION: (?<version_string>.*)/.exec(input)[0];
            },
        };
    }
}

// 4.8
export class AT_XMODEMUUID extends ATCommand {
    /*!
Request modem build UUID

The Nordic-proprietary **%XMODEMUUID** command requests the Universally Unique
Identifier (UUID) of a modem build.
    */
    constructor() {
        super('%XMODEMUUID');
    }
    set() {
        /*!
The set command requests the UUID of a modem build.

Syntax:

    %XMODEMUUID

Response syntax:

    %XMODEMUUID: <UUID>

The response parameter and its defined value is the following:

**<UUID>**
UUID of the modem build. A string without double quotes.

The following command example requests the UUID of a modem build:

    AT%XMODEMUUID
    %XMODEMUUID: 25c95751-efa4-40d4-8b4a-1dcaab81fac9
    OK
*/
        return {
            commnad: `AT${this.command}`,
            parser(input) {
                return /%XMODEMUUID: (?<UUID>.*)/.exec(input)[0];
            },
        };
    }
}

// 4.9
export class AT_XICCID extends ATCommand {
    /*!
Request ICCID

The Nordic-proprietary **%XICCID** command reads the _Integrated Circuit Card
Identifier (ICCID)_ from the _USIM_ card.
    */
    constructor() {
        super('%XICCID');
    }
    set() {
        /*!
The set command reads the _ICCID_ from the _USIM_ card.

Syntax:

    %XICCID

Response syntax:

    %XICCID: <ICCID>

The response parameter and its defined value is the following:

**<ICCID>**
ICCID from the USIM card. A string without double quotes.

The following command example requests the _ICCID_ of the _USIM_ card:

    AT%XICCID
    %XICCID: 8901234567012345678F
    OK
*/
        return {
            command: `AT${this.command}`,
            parser(input) {
                return /%XICCID: (?<ICCID>.*)/.exec(input)[0];
            },
        };
    }
}

// 4.10
export class AT_ODIS extends ATCommand {
    /*! Set and read ODIS fields */
    constructor() {
        super('+ODIS');
    }
    set(HDID, HDMAN, HDMOD, HDSW) {
        /*!
The set command sets ODIS fields.

Syntax:

    +ODIS=<HDID>,<HDMAN>,<HDMOD>,<HDSW>

Note: ODIS fields are written to flash when User Equipment (UE) is powered down by the AT+CFUN=0 command.

The set command parameters and their defined values are the following:

**<Host Device ID>** - String of host device ID in alphanumeric format.
**<Host Device Manufacturer>** - String of host device manufacturer in alphanumeric format.
**<Host Device Model>** - String of host device model in alphanumeric format.
**<Host Device Software Version>** - String of host device software version in alphanumeric format.

The following command example sets host device ID to HDID01, host device manufacturer to HDMAN01,
host device model to HDMOD01, and host device software version to HDSW01:

    AT+ODIS="HDID01","HDMAN01","HDMOD01","HDSW01"
    OK
*/
        return {
            command: `AT${this.command}="${HDID}","${HDMAN}","${HDMOD}","${HDSW}"`,
        };
    }
    read() {
        /*!
The command reads ODIS fields.

The response includes all values except the host device ID.

Response syntax:

    +ODIS: <HDMAN>,<HDMOD>,<HDSW>

The following command example reads the current values:

    AT+ODIS?
    +ODIS: "HDMAN01","HDMOD01","HDSW01"
    OK
*/
        return {
            command: `AT${this.command}?`,
            parser(input) {
                return /\+ODIS: "(?<HDMAN>.*?)","(?<HDMOD>.*?)","(?<HDSW>.*?)"/.exec(
                    input
                )[0];
            },
        };
    }
}

// 4.11
export class AT_ODISNTF extends ATCommand {
    /*!
Subscribe unsolicited ODIS notifications

The **+ODISNTF** command subscribes and unsubscribes ODIS notifications.
    */
    constructor() {
        super('+ODISNTF');
    }
    set(enable = 1) {
        /*!
The set command subscribes and unsubscribes ODIS notifications.

The notifications are triggered by modifications to ODIS fields.

Syntax:

    +ODISNTF=<Reporting>

Notification syntax:

    +CEINFO: <Host Device ID>, <Host Device Manufacturer>, <Host Device Model>, <Host Device Software Version>

The set command parameter and its defined value are the following:

**<reporting>**
    0 – Disable unsolicited notifications
    1 – Enable unsolicited notifications

The following command example subscribes ODIS notificatons:

    AT+ODISNTF=1
    OK

The following is an example of an unsolicited ODIS notification:

    +ODISNTF: "HDID01","HDMAN01","HDMOD01","HDSW01"
*/
        return {
            command: `AT${this.command}=${enable}`,
            parser(input) {
                return /\+ODISNTF: "(?<HDID>.*?)","(?<HDMAN>.*?)","(?<HDMOD>.*?)","(?<HDSW>.*?)"/.exec(
                    input
                )[0];
            },
        };
    }
}
