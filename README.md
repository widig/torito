## this is alpha version, so don't use it in production. just for tests purposes.


# Torito - the best meta tool I ever used.

With Torito you can edit Torito source.

With Torito you can create routes to Torito.

With Torito you can manage files that are in '.'

With Torito you can create web components.

With Torito you can take notes on any file in Torito.


## Getting started:

download. unpack. then run the command:

```
npm install
```

it will start a server on port 3001.

if you need to change it, edit on ./index.js

username: root
password: password

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
        
        

