Bimplus Renderer integration example
=========

This small application demonstrates the usage of the bimplus websdk components
- [bimplus-websdk](https://nemetschekprime.atlassian.net/wiki/spaces/bimpluspublic/pages/1090127532/Bimplus+Web+SDK+Reference)
- [bimplus-webclient](https://nemetschekprime.atlassian.net/wiki/spaces/bimpluspublic/pages/1090127449/Bimplus+Webclient+Reference)
- [bimplus-renderer](https://nemetschekprime.atlassian.net/wiki/spaces/bimpluspublic/pages/1090127443/Bimplus+Renderer+Reference)

Packages are available in [npmjs](https://www.npmjs.com/search?q=bimplus) or in the
Bimplus repositories at [github](https://github.com/bimplus).

without the use of any js framework.

Additionally it shows how to use the bimplus-renderer package to
- Load individual models
- Toggle models on or off
- Set up section planes
- Use the object isolation feature (Transparent, clipped and hidden)
- Zoom to selected objects
- Set up and reset the camera
- Add custom [threejs](https://threejs.org/) objects to the scene

How to build
------------

### Install nodejs
[http://www.nodejs.org/](http://www.nodejs.org/)

### Install global npm modules
Install http-server package for auto reload and convenient development

    npm install -g http-server

### Install local npm modules
Open up a normal command line (admin is not needed) and go to the application folder

    npm install

Also a post process after node package installation is running to copy a worker file to the home folder (See postinstall script)

### Develop/Debug example
goto application folder
	
    npm run serve

Open browser and open address http://127.0.0.1:8080