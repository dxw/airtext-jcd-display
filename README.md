# airTEXT JCDecaux Display Board

This is a simple display board that shows the airTEXT forecast for the next 24 hours. It is designed to be used with a JCDecaux display board, but can be used in any settings that supports HTML and JavaScript.

There are three templates, each defined in `index.html` as a Handlebars template:

- **Alert** - for air pollution and pollen alerts
- **Info** - for general information

We fetch data from the CERC Forecast API and check it against some rules to determine which template to use. If the API cannot be accessed or returns bad data, we fall back to the info template.

Everything happens in the client. There is intentionally no server-side code because the JCDecaux expects the board to be self-contained and the display to run in the browser. This means that the API key is exposed, but this is not a security risk for use with the JCDecaux display boards because they are not accessible to the public.

## Development

To set the API key, run:

```
export CERC_FORECAST_API_KEY="YOUR_API_KEY_HERE"
scripts/set-api-key.sh
```

Install the dependencies:

```bash
$ npm install
```

To watch for changes in the SCSS files and compile them to CSS, run:

```bash
$ yarn run build:css -- --watch
```

To watch for changes in the JS files and compile them to a single JS file, run:

```bash
$ yarn run build:js -- --watch
```

### Linting

There are various linters set up. To run them all with autofix, run:

```bash
$ yarn run lint:all:fix
```

## Deployment

Set the API key as an environment variable.

Run the build script:

```bash
$ yarn run build
```
