#  removes existing zipped code, re-zips it, then udates function on AWS

rm ../lambda-web-app/index.zip;
zip -X -r ../lambda-web-app/index.zip ../lambda-web-app/*;
aws lambda update-function-code --function-name arn:aws:lambda:us-west-2:143018813791:function:scoot-radar --zip-file fileb://index.zip;