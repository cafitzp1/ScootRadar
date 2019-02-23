# removes existing zipped code, re-zips it, then udates function on AWS

# NOTE: run from project directory
rm index.zip
zip -X -r ./index.zip *
aws lambda update-function-code --function-name arn:aws:lambda:us-west-2:143018813791:function:scoot-data-extract --zip-file fileb://index.zip