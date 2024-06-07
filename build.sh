#!/bin/bash

# Clean files
echo -e '\n------------------'
echo 'Clean before build'
echo '------------------'
cd backend
rm -rf ./.gradle
rm -rf ./build
rm -rf ./gradle
rm -rf ./src/main/resources/public
rm -rf ./src/main/resources/view
echo 'Repo clean for build !'
cd ..

# Frontend
echo -e '\n--------------'
echo 'Build Frontend'
echo '--------------'
cd frontend
#./build.sh --no-docker clean init build
./build.sh installDeps build
cd ..

# AngularJS
echo -e '\n---------------'
echo 'Build AngularJS'
echo '---------------'
cd angularJS
./build.sh buildNode
cd ..

# Create directory structure and copy frontend dist
echo -e '\n--------------------'
echo 'Copy front files built'
echo '----------------------'
cd backend
cp -R ../frontend/dist/* ./src/main/resources

# Move old ui to src/main/resources
#cp -R ../frontend/old/* ./src/main/resources/public/
#cp -R ../frontend/old/*.html ./src/main/resources/

# Create view directory and copy HTML files into Backend
mkdir -p ./src/main/resources/view
mkdir -p ./src/main/resources/public/template
mkdir -p ./src/main/resources/public/img
mkdir -p ./src/main/resources/public/js
mkdir -p ./src/main/resources/i18n
mv ./src/main/resources/*.html ./src/main/resources/view

# Copy all built files from AngularJS into Backend
cp -R ../angularJS/src/view/* ./src/main/resources/view
cp -R ../angularJS/src/css/* ./src/main/resources/public
cp -R ../angularJS/src/dist/* ./src/main/resources/public/js
cp -R ../angularJS/src/template/* ./src/main/resources/public/template
cp -R ../angularJS/src/img/* ./src/main/resources/public/img
cp -R ../angularJS/src/i18n/* ./src/main/resources/i18n

# Copy all public files from frontend into Backend
cp -R ../frontend/public/* ./src/main/resources/public
echo 'Files all copied !'

# Build .
echo -e '\n-------------'
echo 'Build Backend'
echo '-------------'
#./build.sh --no-docker clean build
./build.sh clean build

# Clean up - remove compiled files in front folders
echo -e '\n-------------'
echo 'Clean front folders'
echo '-------------'
rm -rf ../frontend/dist
rm -rf ../angularJS/src/js
rm -rf ../angularJS/src/view
rm -rf ../angularJS/src/css
rm -rf ../angularJS/src/dist
echo 'Folders cleaned !'