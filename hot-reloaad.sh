#!/bin/sh

# WORKDIR="$HOME/.config/ags_ts"
WORKDIR="."

function build() {
  npm run build
}

function reload_ags() {
  pkill ags
  ags --inspector -c $WORKDIR/config.js &
}

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
    npm run build:js
    reload_ags
    ;;
  scss)
		echo "reload SCSS..."
		npm run build:css
		ags --run-js "ags.App.resetCss(); ags.App.applyCss('config.css');" #&>/dev/null
    ;;
  esac
done
