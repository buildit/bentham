#!/bin/bash
if [ -z "$ICARUS_STAGE"] && [ -z "$FORCE_E2E"]; then
  echo "Skipping end-to-end tests as code is not deployed";
  exit 0;
fi

echo "Installing headless Chrome"
sh -e /etc/init.d/xvfb start
sleep 3
fluxbox >/dev/null 2>&1 &

echo "Running end2end tests"
cd client
yarn e2e