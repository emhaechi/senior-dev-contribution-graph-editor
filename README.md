
# Senior Dev Contribution Graph Editor


## Description

Senior Dev Contribution Graph Editor is a small FireFox browser extension that allows visually editing the contributions graph/grid appearing on the user profiles of a certain well-known Git repository hub.

Features:

- adjust the contribution graph colors
- run predefined animations over the graph

Features can be adjusted in the extension's options menu accessible via Firefox's Add-ons Manager.


## Installation and Browser Permissions

The browser extension will request the following permissions on installation:

- Run on pages on GitHub.com.
- Access the "storage" JavaScript API, only for persisting and restoring the extension's own settings (such as the chosen colors).

Builds are distributed only through the Firefox Add-ons site, [AMO](https://addons.mozilla.org): [Extension's page](https://addons.mozilla.org/en-US/firefox/addon/senior-dev-contribution-graph/)


## Development and Build

The app directory contains the extension's distributable source files and assets. spec contains unit tests and supporting scripts and configuration.

Unit tests are written with jasmine and configured to run in Firefox. See config in spec/support/jasmine-browser.json.

This project makes use of the "web-ext" CLI tool, developed by Mozilla, for development and builds of the extension: [web-ext guide](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/)

The following are typical CLI commands used during development. All commands are to be invoked at this project's root and are defined as run scripts in the package.json, unless otherwise stated.

To start, install the npm packages:

```sh
npm install
```

To validate config:

```sh
npm run lint
```

To run/auto-deploy a hot reload build of the extension for local testing:

```sh
npm run start
```

To run with more detailed logging in the terminal:

```sh
npm run start:logs
```

To test without manually loading the test server:

```sh
npm run test
```

To test with the server, run the following and navigate to the indicated localhost address (localhost:8888), which allows debugging and visual verification as needed:

```sh
npm run test:serve
```

To produce a build for distribution, run the following command. A zip file will be generated into the bin directory:

```sh
npm run build
```


## Design

UI decisions try to follow Mozilla's Acorn design system for Firefox: <https://acorn.firefox.com>


## License

Source code is licensed under MPL 2.0. See LICENSE for a copy of the MPL.


Copyright 2023 Michael Hobbs
