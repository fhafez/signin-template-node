#!/bin/bash

CHANGED_FILES=`git diff HEAD^ HEAD --name-only`

echo $CHANGED_FILES

gcloud --quiet beta functions deploy function-1 --source https://source.developers.google.com/projects/scenic-setup-231121/repos/github_fhafez_signin-template-node/moveable-aliases/master/paths/gcp-functions/function-1 --trigger-http

