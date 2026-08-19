# Cellular Monitor app

[![License](https://img.shields.io/badge/license-Modified%20BSD%20License-blue.svg)](LICENSE)

The Cellular Monitor app in nRF Connect for Desktop lets you capture and analyze
modem traces.

## Installation

The Cellular Monitor app is installed from nRF Connect from Desktop. For
detailed steps, see
[Installing nRF Connect for Desktop apps](https://docs.nordicsemi.com/bundle/swtools_docs/page/app/nrf-connect-desktop/installing_apps.html)
in the nRF Connect from Desktop documentation.

## Documentation

Read the
[Cellular Monitor app](https://docs.nordicsemi.com/bundle/swtools_docs/page/app/pc-nrfconnect-cellularmonitor/index.html)
official documentation.

## Development

See the [app development](https://nordicsemi.github.io/pc-nrfconnect-docs/)
pages for details on how to develop apps for the nRF Connect for Desktop
framework.

### Additional steps to use the '@nordicsemi/nrfml-js' package

For license reasons, `@nordicsemi/nrfml-js` is a private package available only
at https://npm.pkg.github.com.

To install it, you need a GitHub token.

Before running `npm ci` or
`npm install --registry https://npm.pkg.github.com/ @nordicsemi/nrfml-js@latest`
set up authentication:

1. Verify that your GitHub user has the required privileges: You must be able to
   visit https://github.com/nordicsemi/nrfml/pkgs/npm/nrfml-js.

1. Go to https://github.com/settings/tokens/new and create a personal access
   token (classic). Fine-grained tokens currently cannot read packages, so you
   must use a classic token. Grant only the `read:packages` scope.

1. Select `Configure SSO` and authorize the organization `nordicsemi`, then copy
   the token for the next step.

1. Create or edit `.npmrc` (and of course never share its contents) and add the
   line `//npm.pkg.github.com/:_authToken=ghp_XXXXX`, replacing `ghp_XXXXX` with
   the token from step 2.

    It is recommended to _not_ add
    `@nordicsemi:registry=https://npm.pkg.github.com/` to `.npmrc`, because that
    would request all `@nordicsemi` scoped packages from
    https://npm.pkg.github.com. Some packages with that scope may not be
    available there, only in the default registry at https://npmjs.com.

    When installing or updating this package, specify the registry explicitly,
    for example:
    `npm install --registry https://npm.pkg.github.com/ @nordicsemi/nrfml-js@latest`

    The information from which registry a package stems is stored in
    `package-lock.json`. After installing the package as described, you can
    simply run `npm ci` to install the same version again.

## Feedback

Please report issues on the [DevZone](https://devzone.nordicsemi.com) portal.

## Contributing

See the
[information on contributing](https://nordicsemi.github.io/pc-nrfconnect-docs/contributing)
for details.

## License

See the [LICENSE](LICENSE) file for details.
