# Managing modem credentials

You can store and update modem credentials, such as keys or certificates, manually by sending [Credential storage management %CMNG](https://docs.nordicsemi.com/bundle/ref_at_commands/page/REF/at_commands/security/cmng.html) commands to the modem. The certificate manager simplifies this process by offering a graphical user interface for updating credentials.

Before you can update the credentials stored by the modem, you must put the modem into the offline state by sending the `AT+CFUN=4` AT command.

Each set of keys and certificates that is stored in the modem is identified by a security tag. This means that all related credentials share the same security tag. Send the `AT%CMNG=1` command in the terminal view to display a list of all certificates that are stored on your device. If you have added your device in nRF Cloud, you should see a Certificate Authority (CA) certificate, a client certificate, and a private key with security tag 16842753, which is the security tag for nRF Connect for Cloud credentials.

The credentials can be managed in the following ways:

- To add or update credentials, enter a security tag and the new keys or certificates. Then click **Update certificates**.</br>
  Instead of entering the credentials manually, you can also import a JSON file. To do so, click **Load from JSON**.
- To delete a key or certificate, select the checkbox next to it. Then click **Update certificates**.

    !!! note "Note"
        Deleting the text from the text field does not cause the key or certificate to be unset.
