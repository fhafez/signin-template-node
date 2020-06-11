#!/bin/bash

ALL_DIRS=`ls -1d gcp-functions/* | sed s/gcp-functions\\\///g`
CHANGED_FILES=`git diff HEAD^ HEAD --name-only | grep -v test\/`
#CHANGED_FILES=`git diff master origin/master --name-only`
COMPLETED=()

echo $CHANGED_FILES
echo $ALL_DIRS

for f in ${CHANGED_FILES}; do
   fname=`echo $f | awk -F/ '{print $2}'`

   # if the file was .html or .js then update it in GCS
   if [[ $f == *".js" || $f == *".html"]]; then
      gsutil cp /home/travis/build/fhafez/signin-template-node/$f gs://index.parcsignin.com/whitby/
   fi;
   

   # if one of the GCP Functions changed then perform a deploy on that specific function
   if [[ $ALL_DIRS == *"$fname"* && $COMPLETED != *"$fname"* ]]; then 
      echo $fname;
      COMPLETED+=($fname)

      # if this function is triggered by PubSub then it's name must end in .sub
      if [[ $fname == *".sub" ]]; then
         topic=`echo $fname |  cut -d'-' -f 2 | rev | cut -c5- | rev`;
         gcloud --quiet beta functions deploy $topic --source https://source.developers.google.com/projects/signaturemountain-240415/repos/github_fhafez_signin-template-node/moveable-aliases/signaturemountain-240415/paths/gcp-functions/$fname --trigger-topic $topic --runtime nodejs8 --memory=128MB
      else
         #gcloud --region="us-central1" --quiet beta functions deploy $fname --source https://source.developers.google.com/projects/scenic-setup-231121/repos/github_fhafez_signin-template-node/moveable-aliases/master/paths/gcp-functions/$fname --trigger-http 
         gcloud --quiet beta functions deploy $fname --source https://source.developers.google.com/projects/signaturemountain-240415/repos/github_fhafez_signin-template-node/moveable-aliases/signaturemountain-240415/paths/gcp-functions/$fname --trigger-http 
      fi;
   fi;
done


