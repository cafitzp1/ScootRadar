# updates the static s3 web files

# NOTE: run `sh update-s3-web-app.sh` from the s3-web-app directory
aws s3 cp ./index.html s3://tempescootradar/ --acl public-read;
aws s3 cp ./js/index.js s3://tempescootradar/js/ --acl public-read;
# aws s3 cp ./css/index.css s3://tempescootradar/css/ --acl public-read;
# aws s3 cp ./js/util.js s3://tempescootradar/js/ --acl public-read;