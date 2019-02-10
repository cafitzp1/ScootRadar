# updates the static s3 web files

aws s3 cp ../s3-web-app/index.html s3://tempescootradar/ --acl public-read;
aws s3 cp ../s3-web-app/css/index.css s3://tempescootradar/css/ --acl public-read;
aws s3 cp ../s3-web-app/js/index.js s3://tempescootradar/js/ --acl public-read;