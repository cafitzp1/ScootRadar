# removes existing zipped code, re-zips it, then udates function on AWS

# NOTE: run `sh update-lambda-web-app.sh` from the lambda-web-app directory
rm index.zip
zip -X -r ./index.zip *
aws lambda update-function-code --function-name arn:aws:lambda:us-west-2:143018813791:function:scoot-radar --zip-file fileb://index.zip