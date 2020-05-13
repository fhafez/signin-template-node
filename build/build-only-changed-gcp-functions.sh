#!/bin/bash

ALL_DIRS=`ls -1 gcp-functions`
CHANGED_FILES=`git diff HEAD^ HEAD --name-only | grep -v test\/`
#CHANGED_FILES=`git diff master origin/master --name-only`

echo $CHANGED_FILES
echo $ALL_DIRS

for f in ${CHANGED_FILES}; do
   fname=`echo $f | awk -F/ '{print $2}'`
   # if one of the GCP Functions changed then perform a deploy on that specific function
   if [[ $ALL_DIRS == *"$fname"* ]]; then 
      echo $fname; 

      # if this function is triggered by PubSub then it's name must end in .sub
      if [[ $fname == *".sub" ]]; then
         topic=`echo $f |  cut -d'_' -f 2 | rev | cut -c5- | rev`;
         gcloud --quiet beta functions deploy $fname --source https://source.developers.google.com/projects/scenic-setup-231121/repos/github_fhafez_signin-template-node/moveable-aliases/master/paths/gcp-functions/$fname --trigger-topic $topic --runtime nodejs8 --memory=128MB
      else
         #gcloud --region="us-central1" --quiet beta functions deploy $fname --source https://source.developers.google.com/projects/scenic-setup-231121/repos/github_fhafez_signin-template-node/moveable-aliases/master/paths/gcp-functions/$fname --trigger-http 
         gcloud --quiet beta functions deploy $fname --source https://source.developers.google.com/projects/scenic-setup-231121/repos/github_fhafez_signin-template-node/moveable-aliases/master/paths/gcp-functions/$fname --trigger-http 
      fi;
   fi;
done


