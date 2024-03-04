#!/usr/bin/env bash

pattern_event="(sink|source)-?(input)? #([0-9]+)"

function emit() {
	# pulsemixer --list-${1}s | sed -r "s#^.*(${1})-?(input)?-([0-9]+).*Name: (.*), Mute: (0|1).*'([0-9]+)%'.*\$#AUDIO type=\1-\2 id=\3 name=\"\4\" muted=\5 volume=\6#g" | sed "s/${1}- /${1} /" | ([[ -n $2 ]] && grep id=$2 || cat - )
	pulsemixer --list-${1}s | sed -r "s#^.*ID: (${1})-?(input|output)?-([0-9]+), Name: (.*), Mute: (0|1)(.*)Volumes: \['([0-9]+)%'(, '[0-9]+%'])?,? ?(Default)?#AUDIO::\1-\2 id=\3 name=\"\4\" muted=\5 volume=\7 default=\9#g" | sed "s/${1}- /${1} / ; s/default=Default/default=1/" | ([[ -n $2 ]] && grep id=$2 || cat - )
}

function watch() {

	emit "sink"
	emit "source"

	pactl subscribe | grep --line-buffered "Event 'change' on sink\|Event 'change' on source" | while read -r line; do
		if [[ $line =~ $pattern_event ]]; then
			type="${BASH_REMATCH[1]}"
			input="${BASH_REMATCH[2]}"
			id="${BASH_REMATCH[3]}"

			emit $type $id
		fi

	done
}

watch
