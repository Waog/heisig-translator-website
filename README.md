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

### Updating the Dictionary, Heisig Data, and SUBTLEX-CH Frequencies

To update the CEDICT dictionary, Heisig data, and SUBTLEX-CH word frequencies used by the application, run the following command:

```bash
npm run update-assets
```

This will run the `update-dictionary`, `update-heisig`, and `update-frequencies` scripts to download the latest CEDICT file, fetch the Heisig data from the Google Sheets link, and process the SUBTLEX-CH word frequencies, updating the corresponding JSON files in the `src/assets/` directory.

Alternatively, you can run the scripts individually:

To update the CEDICT dictionary:

```bash
npm run update-dictionary
```

To update the Heisig data:

```bash
npm run update-heisig
```

To update the SUBTLEX-CH word frequencies:

```bash
npm run update-frequencies
```

### SUBTLEX-CH Documentation

For more detailed information about the SUBTLEX-CH word frequencies and the data provided, refer to the documentation located in the [`doc/SUBTLEX-CH/`](doc/SUBTLEX-CH/) folder. This includes:

- [`new combined word frequency and PoS file.md`](doc/SUBTLEX-CH/new%20combined%20word%20frequency%20and%20PoS%20file.md): Information about the combined word frequency and part-of-speech file.
- [`PKU PoS system labels.txt`](doc/SUBTLEX-CH/PKU%20PoS%20system%20labels.txt): Descriptions of the labels used in the PKU part-of-speech tagging system.
- [`Plos ONE article of Cai & Brysbaert.pdf`](doc/SUBTLEX-CH/Plos%20ONE%20article%20of%20Cai%20&%20Brysbaert.pdf): The article describing the methodology behind SUBTLEX-CH.
- [`the lexical decision data we collected and used in this study.csv`](doc/SUBTLEX-CH/the%20lexical%20decision%20data%20we%20collected%20and%20used%20in%20this%20study.csv): The lexical decision data used in the study.

## Additional Help

For more information on Angular CLI, use `ng help` or visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli).
