# LockedIn

## Overview

LockedIn is a Chrome extension that allows users to block specific websites. The extension provides a popup interface where users can add or remove websites from the blocklist. The blocked websites are stored in Chrome's local storage, and the extension updates Chrome's blocking rules accordingly.

## File Structure Descriptions
Thanks to this [StackOverflow explanation](https://stackoverflow.com/a/22844164)

- `src/`: "source" code to build and develop the project.

- `dist/`: "distribution", the compiled code meant to actually use in production.

- `assets/`: static content like images, video, audio, fonts etc.

- `node_modules/`: includes libraries and dependencies for JS packages, used by NPM.

### Specific:

- `package.json`: defines libraries and dependencies for JS packages, used by Npm.
- `package-lock.json`: specific version lock for dependencies installed from `package.json`, used by Npm.
- `.gitignore`: Specification of the files meant to be ignored by Git.
- `tsconfig.json`: Configuration file for TypeScript.

## Contributing
If you would like to contribute to this project, please follow the steps below:

1. Install Node.js and npm.
2. Clone the repository.
3. Run `npm install` to install the necessary dependencies.
4. Run `npm run build` to build the project.
    - This will transpile the TypeScript files in the `src/` directory and output the transpiled JavaScript files in the `dist/src/` directory.
5. Load the extension in Chrome by following the steps below:
    - Open Chrome and navigate to `chrome://extensions/`.
    - Enable Developer mode by toggling the switch in the top right corner.
    - Click on the "Load unpacked" button and select the `dist/` directory.
