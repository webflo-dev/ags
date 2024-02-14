#!/usr/bin/env bash

workspaces="$(hyprctl monitors -j | jq -r 'map(.activeWorkspace.id)')"
windows="$(hyprctl clients -j | jq -r --argjson workspaces "$workspaces" 'map(select([.workspace.id] | inside($workspaces)))')"
geometry=$(echo "$windows" | jq -r '.[] | "\(.at[0]),\(.at[1]) \(.size[0])x\(.size[1])"' | slurp)

echo $geometry
