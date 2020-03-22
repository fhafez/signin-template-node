#!/bin/bash

ALL_DIRS=`ls -1 gcp-functions`
CHANGED_FILES=`git diff HEAD^ HEAD --name-only`
#CHANGED_FILES=`git diff master origin/master --name-only`

echo $CHANGED_FILES
echo $ALL_DIRS

for f in ${CHANGED_FILES}; do
   fname=`echo $f | awk -F/ '{print $2}'`
   # echo $f
   if [[ $ALL_DIRS == *"$fname"* ]]; then 
      echo $fname; 
      #gcloud --region="us-central1" --quiet beta functions deploy $fname --source https://source.developers.google.com/projects/scenic-setup-231121/repos/github_fhafez_signin-template-node/moveable-aliases/master/paths/gcp-functions/$fname --trigger-http 
      gcloud --quiet beta functions deploy $fname --source https://source.developers.google.com/projects/scenic-setup-231121/repos/github_fhafez_signin-template-node/moveable-aliases/master/paths/gcp-functions/$fname --trigger-http 
   fi;
done


