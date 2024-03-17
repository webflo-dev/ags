#!/usr/bin/env bash

function start(){
  hyprctl --batch "keyword decoration:blur:enabled 0; keyword decoration:active_opacity 1; keyword decoration:inactive_opacity 1" &> /dev/null

  echo "selection start"

  workspaces="$(hyprctl monitors -j | jq -r 'map(.activeWorkspace.id)')"
  windows="$(hyprctl clients -j | jq -r --argjson workspaces "$workspaces" 'map(select([.workspace.id] | inside($workspaces)))')"
  geometry=$(echo "$windows" | jq -r '.[] | "\(.at[0]),\(.at[1]) \(.size[0])x\(.size[1])"' | slurp)

  if [[ "$?" -ne "0" ]]; then
    # hyprctl reload &> /dev/null
    stop
    echo "selection cancelled"
    exit 0
  fi

  if [[ -n $XDG_VIDEOS_DIR ]]; then
    target_dir=$XDG_VIDEOS_DIR/recording
    mkdir -p $target_dir
  else
    target_dir=$HOME
  fi

  file_name="recording_$(date '+%Y-%m-%d__%H-%M-%S.mp4')"

  file="${target_dir}/${file_name}"

  echo "recording ${file}"

  wf-recorder -g "${geometry}" -f "${file}" &> /dev/null

  echo "done ${file}"
}

function stop(){
  killall -s SIGINT wf-recorder
  hyprctl reload &> /dev/null
}

case $1 in
  start) start;;
  stop) stop;;
  *) exit 1;;
esac




