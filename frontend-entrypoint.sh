#!/bin/sh
set -e

API_URL="${PUBLIC_API_URL:-/}"
escaped=$(printf '%s' "$API_URL" | sed 's/\\/\\\\/g; s/"/\\"/g')
printf 'window.__APP_CONFIG__ = { API_URL: "%s" };\n' "$escaped" > /usr/share/nginx/html/env.js

exec "$@"
