#!/bin/sh

WORKDIR="$HOME/.config/ags_ts"

function build() {
  npm run build
}

function _ags() {
  pkill ags
  ags --inspector -c $WORKDIR/config.js &
}

_ags
inotifywait --quiet --monitor --event create,modify,delete --recursive $WORKDIR | while read DIRECTORY EVENT FILE; do
  file_extension=${FILE##*.}
  case $file_extension in
    js)
		echo "reload JS..."
    _ags
    ;;
  ts )
    echo "reload TS..."
    build
    _ags
    ;;
  scss)
		echo "reload SCSS..."
		sassc "$WORKDIR/scss/index.scss" "$WORKDIR/style.css"
		ags --run-js "ags.App.resetCss(); ags.App.applyCss('style.css');" #&>/dev/null
    ;;
  esac
done
