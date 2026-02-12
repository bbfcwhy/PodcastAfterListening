#!/usr/bin/env bash

set -e

# Parse command line arguments
JSON_MODE=false
ARGS=()

for arg in "$@"; do
    case "$arg" in
        --json) 
            JSON_MODE=true 
            ;;
        --help|-h) 
            echo "Usage: $0 [--json]"
            echo "  --json    Output results in JSON format"
            echo "  --help    Show this help message"
            exit 0 
            ;;
        *) 
            ARGS+=("$arg") 
            ;;
    esac
done

# Get script directory and load common functions
SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Get all paths and variables from common functions
eval $(get_feature_paths)

# Check if we're on a proper feature branch (only for git repos)
check_feature_branch "$CURRENT_BRANCH" "$HAS_GIT" || exit 1

# Ensure the feature directory exists
if [[ ! -d "$FEATURE_DIR" ]]; then
    # Try creating it if we're just setting up tasks but directory missing (unlikely if followed flow)
    mkdir -p "$FEATURE_DIR"
fi

# Copy tasks template if it exists
TEMPLATE="$REPO_ROOT/.specify/templates/tasks-template.md"
if [[ -f "$TEMPLATE" ]]; then
    if [[ -f "$TASKS" ]]; then
        echo "Warning: tasks.md already exists at $TASKS"
    else
        cp "$TEMPLATE" "$TASKS"
        echo "Copied tasks template to $TASKS"
    fi
else
    echo "Warning: Tasks template not found at $TEMPLATE"
    # Create a basic tasks file if template doesn't exist
    if [[ ! -f "$TASKS" ]]; then
        touch "$TASKS"
        echo "# Tasks" > "$TASKS"
    fi
fi

# Output results
if $JSON_MODE; then
    printf '{"TASKS":"%s","FEATURE_DIR":"%s","BRANCH":"%s"}\n' \
        "$TASKS" "$FEATURE_DIR" "$CURRENT_BRANCH"
else
    echo "TASKS: $TASKS"
    echo "FEATURE_DIR: $FEATURE_DIR"
    echo "BRANCH: $CURRENT_BRANCH"
fi
