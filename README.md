# airTEXT JCDecaux Display Board

This is a simple display board that shows the airTEXT forecast for the next 24 hours. It is designed for a JCDecaux Roadside Digital 6-sheet display board (1080 x 1920), but can be used in any setting that supports HTML and JavaScript.

At time of writing, the JCDecaux display boards run on Chromium 87, so this project targets that browser and cannot use some newer web features.

We fetch data from the CERC Forecast API and check it against some rules to determine which template (defined in `index.html` as Handlebars templates) to use.

There are three dynamic templates triggered by specific rules. In priority order they are:

- **Air pollution alert for today** - when there is an air pollution alert for today
- **Air pollution alert for tomorrow** - when there is an air pollution alert for tomorrow (but not today)
- **Pollen alert** - when there is a pollen alert for today

When none of the conditions is met, or when the API cannot be accessed, we fall back to one of the three static info templates (picked randomly):

- **Subscription actionable**
- **Subscription reflexive**
- **Educational**

Everything happens in the client. There is intentionally no server-side code because the JCDecaux expects the board to be self-contained and the display to run in the browser. This means that the API key is exposed, but this is not a security risk for use with the JCDecaux display boards because they are not accessible to the public.

## Configuring zone and screen orientation

The zone and screen orientation are defined in `config/config.js`. Changing the zone will change the forecast, but note that the logos will not change. The screen orientation is landscape by default, but should be set to `portrait` for JCDecaux boards.

## Development

To set the API key, run:

```
export CERC_FORECAST_API_KEY="YOUR_API_KEY_HERE"
scripts/set-api-key.sh
```

Install the dependencies:

```bash
$ yarn install
```

To watch for changes in the SCSS files and compile them to CSS, run:

```bash
$ yarn run build:css --watch
```

To watch for changes in the JS files and compile them to a single JS file, run:

```bash
$ yarn run build:js --watch
```

`index.html` can be accessed directly in the browser, or you can run a local server:

```bash
$ yarn run serve
```

To do all of the above in one command, run:

```bash
$ yarn run dev
```

### Dummy data

Append `?dummy=[scenario]` to the URL to test the different scenarios. The following scenarios are available:

- `normal` (i.e. low pollution and low pollen)
- `veryHighPollutionToday`
- `highPollutionToday`
- `moderatePollutionToday`
- `veryHighPollenToday`
- `highPollenToday`
- `moderatePollenToday`
- `highPollutionTomorrow`
- `moderatePollutionTomorrow`

Append `?dummy=normal&info=[template]` to the URL to test the different info templates. The following templates are available:

- `subscription-actionable`
- `subscription-reflexive`
- `educational`

Examples of the screens shown for the scenarios can be found in the `screenshots` directory.

### Testing

To run the tests with Playwright, run:

```bash
$ yarn run test
```

### Linting

There are various linters set up. To run them all with autofix, run:

```bash
$ yarn run lint:all:fix
```

## Deployment

### Deploying to a server like Heroku

Set the API key as an environment variable and ensure `scripts/set-api-key.sh` is run on deployment.

Run the build script (this will be run automatically on Heroku):

```bash
$ yarn run build
```

### Deploying to JCDecaux display boards

1. Set the screen orientation in `config/config.js` to `portrait`.
2. Set the API key in `config/api-key.json`.
3. Run `./scripts/create-jcd-zip.sh` to create a zip file that can be uploaded to the JCDecaux display boards.

## Updating the Node version

To update the Node version, update the version number in the following files:

- `github/continuous-integration.yml`
- `package.json`

If you don't have that version of node installed, use `nvm` (Node Version
Manager) to install it:

```bash
nvm install v22.13.1
```

You may also need to update yarn on your new node version:

```bash
  npm upgrade yarn
  yarn install
```
