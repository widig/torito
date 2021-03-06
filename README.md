# Torito - The web runtime editor

With Torito you can edit Torito source.

With Torito you can create routes to Torito.

With Torito you can manage files that are in '.'

With Torito you can create web components. Torito interface is an example of use its components.

With Torito you can take notes on any file in Torito.


## Getting started:

download. unpack. then run the command:

```
npm install
```

it will start a server on port 3002.

if you need to change it, edit on ./index.js

demo at ["heroku"](https://ancient-gorge-38573.herokuapp.com)

username: root
password: password

After login, click on logo to get access to menu. Click on Routes. Add '/HelloWorld1' for example with option GET marked, in the form. It will result in a text code like this:

```
(function(){
	return function(req,res){ res.send("/helloWorld1");};
})();
```

then you can access domain/helloWorld1 because it is already online!

## Folder Structure

    private/torito
        acl
        client
        includes
        lib
        notes
        routes
      
### private/torito/acl

stores the access control list data.

### private/torito/client

stores the web interface .

### private/torito/includes

stores the allowed server modules.

### private/torito/lib

stores the server modules.

### private/torito/notes

stores the notes.

### private/torito/routes

stores the routes.

## Web Server Route Structure

    post
        /session/list
        /session/ownlevel
        /session/ownname
        /session/remove
        /file/dir
        /file/mkdir
        /file/rm
        /file/rmdir
        /file/touch
        /file/update
        /route/list
        /route/get
        /routes/install
        /route/remove
        




