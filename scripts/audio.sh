#!/usr/bin/env bash

pattern_event="(sink-input|sink|source|source-output) #([0-9]+)"
pattern_volume="([0-9]+)%"
pattern_mute="(yes|no)"

function emit() {
	type=$1
	id=$2
	volume=$(pactl get-$type-volume $id)
	if [[ $volume =~ $pattern_volume ]]; then
		volume="${BASH_REMATCH[1]}"
	else
		volume=""
	fi

	muted=$(pactl get-$type-mute $id)
	if [[ $muted =~ $pattern_mute ]]; then
		muted="${BASH_REMATCH[1]}"
	else
		muted=""
	fi

	echo "AUDIO::$type volume=$volume muted=$muted"
}

function watch() {
	emit sink @DEFAULT_SINK@
	emit source @DEFAULT_SOURCE@

	pactl subscribe | grep --line-buffered "Event 'change' on sink\|Event 'change' on source" | while read -r line; do
		if [[ $line =~ $pattern_event ]]; then
			type="${BASH_REMATCH[1]}"
			id="${BASH_REMATCH[2]}"
			case "$type" in
			sink)
				id="@DEFAULT_SINK@"
				;;
			source)
				id="@DEFAULT_SOURCE@"
				;;
			esac

			emit $type $id
		fi

	done

}

watch
