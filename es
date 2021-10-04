#!/bin/bash

HELP="$0: Use a binary to run a script in its root directory after cd-ing into it and return to the current directory.
\$1 Execute a script by its alias."
CURRENT_PATH="$(pwd)"
FIND_THIS_ALIAS="$1"
OVERRIDE_PARAMS="$2"
ALIAS_APATH="$HOME/.bookmarks.exec-script"
# Format: [alias] [binary] [file] [params] [dir]

[[ $1 =~ -h(elp) ]] && echo -e $HELP && exit 1
[[ -z $FIND_THIS_ALIAS ]] && echo "Provide an alias to the script." && exit 1

function die () {
    echo -e "$1" && exit $2
}

function is_valid_path() {
    local p="$1"
    local t="$2"

    [[ $t = "d" ]] && [[ ! -d $p ]] && die "Invalid file path: $p" 1
    [[ $t = "f" ]] && [[ ! -f $p ]] && die "Invalid file path: $p" 1
}


function load_aliases() {
    set IFS=$'\n'
    local lines=($(cat $ALIAS_APATH))

    for i in ${lines[@]}; do
        [[ ! $i =~ "::" ]] && continue
        [[ $i =~ "^#" ]] && continue

        local idx=1

        local binary=
        local alias=
        local file=
        local param=
        local dirpath=

        for j in $(echo $i | tr '::' $'\n'); do
            j="${j##* }"
            j="${j%% *}"
            j="${j//\~/$HOME}"

            [ $idx == 1 ] && alias="$j"
            [ $idx == 2 ] && binary="$j"
            [ $idx == 3 ] && file="$j"
            [ $idx == 4 ] && param="$j"
            [ $idx == 5 ] && dirpath="$j" && dirpath="${dirpath%%/}"

            idx=$[idx + 1]
        done

        if  [[ $alias =~ $FIND_THIS_ALIAS ]]; then
            [[ $file = "NONE" ]] && file=""
            [[ $dirpath = "NONE" ]] && dirpath=""
            [[ $params = "NONE" ]] && params=""
            [[ -n $OVERRIDE_PARAMS ]] && params="'$OVERRIDE_PARAMS'"


            [[ -n $dirpath ]] && is_valid_path $dirpath "d"
            [[ -n $file ]] && \
                file="$dirpath/$file" && \
                is_valid_path $file "f"


            cd $dirpath
            echo "$binary $file $params"
            eval "$binary $file $params"
            cd $CURRENT_PATH
        fi
    done
}

is_valid_path $ALIAS_APATH "f"
load_aliases
