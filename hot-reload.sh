#!/usr/bin/env bash

WORKDIR="."
CSS_FILE="config.css"
CONF_FILE="config.js"
INSPECTOR=$([ "$1" == "-i" ] && echo " --inspector " || echo "")

function build_js() {
  npm run build:js
}
function build_css() {
  npm run build:css
}

function reload_css() {
		ags --run-js "ags.App.resetCss(); ags.App.applyCss('$CSS_FILE');" #&>/dev/null
}

function reload_ags() {
  pkill ags
  ags $INSPECTOR -c $WORKDIR/$CONF_FILE &
}


build_css
build_js
reload_ags

inotifywait --quiet --monitor --event create,modify,delete --recursive $WORKDIR | while read DIRECTORY EVENT FILE; do
  file_extension=${FILE##*.}
  case $file_extension in
    js)
		echo "reload JS..."
    reload_ags
    ;;
  ts )
    echo "reload TS..."
    build_js
    reload_ags
    ;;
  scss)
		echo "reload SCSS..."
		build_css
    reload_css
    ;;
  esac
done
