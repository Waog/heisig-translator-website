# Heisig Translator Website

This Angular application uses the Heisig approach to translate Chinese characters into their English equivalents. The translation occurs in real-time as the user types.

## Usage

Visit the live application at: [waog.github.io/heisig-translator-website/](https://waog.github.io/heisig-translator-website/)

## Development

### Running the Development Server

To run the development server, execute:

```bash
ng serve
```

Navigate to `http://localhost:4200/` to view the application. The app will automatically reload if you make changes to the source files.

### Building the Project

To build the project, use:

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

### Running Tests

#### Unit Tests

To run unit tests:

```bash
ng test
```

#### End-to-End Tests

To run end-to-end tests:

```bash
ng e2e
```

Note: You may need to add a package that implements end-to-end testing capabilities.

### Updating the Dictionary and Heisig Data

To update the CEDICT dictionary and Heisig data used by the application, run the following command:

```bash
npm run update-assets
```

This will run the `update-dictionary` and `update-heisig` scripts to download the latest CEDICT file and fetch the Heisig data from the Google Sheets link, updating the `cedict.json` and `heisig.json` files in the `src/assets/` directory.

Alternatively, you can run the scripts individually:

To update the CEDICT dictionary:

```bash
npm run update-dictionary
```

To update the Heisig data:

```bash
npm run update-heisig
```

## Additional Help

For more information on Angular CLI, use `ng help` or visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli).
