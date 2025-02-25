# airTEXT JCDecaux Display Board

This is a simple display board that shows the airTEXT forecast for the next 24 hours. It is designed to be used with a JCDecaux display board, but can be used with any display board that supports HTML.

We fetch data from the airTEXT API and display it on the board.

The different board designs are defined in `index.html` as Handlebars templates.

# Development
Run
```
npm run build:css -- --watch
```
to watch for changes in the SCSS files and compile them to CSS.

Run
```
npm run build:js -- --watch
```
to watch for changes in the JS files and compile them to a single JS file.

# Deployment
[to do]