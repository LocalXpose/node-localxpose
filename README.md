<div align="center">
    <a href="https://localxpose.io">
        <img src="https://svgshare.com/i/LhY.svg" width="400px"/>
    </a>
</div>


# Nodejs Client Library
The official nodejs binding for LocalXpose

## Prerequisites

You can use this library as a guest account or by applying your access token, If you don't have an account you can create one, [sign up for a new account][LocalXpose URL] or [login][LocalXpose URL] and get your access token.

<br/>

## Installation

```
npm install localxpose

# or 
 
yarn add localxpose
```

<br/>

## Usage
### 1. Creating a LocalXpose client

Passing in an access token or leave it empty for a guest limited account
```js
const LocalXpose = require('localxpose')
const client = new LocalXpose('YOUR_ACCESS_TOKEN')

// or using an access token stored in an environment variable as LOCALXPOSE_ACCESS_TOKEN
const client = new LocalXpose()
```

### 2. Start your tunnel
#### http tunnel
```js
(async function(){
let httpTunnel = await client.http()
// or
let httpTunnel = await client.http({
    region: 'us', // us, ap or eu (default: us)
    to: '127.0.0.1:9090', // address to forward to (default: 127.0.0.1:8080) 
    subdomain: 'hello-world', // tunnel subdomain (default: random)
    reservedDomain: 'my.custom-domain.com', // reserved domain
    hostheader: 'myapp.localhost.com', // rewrite host header 
    basicAuth: 'user:pass', // protect the tunnel with username and password
    eventCallback: callback // tunnel events callback 
})
})()
// or
client.http()
.then((tunnel) => console.log(`I am available on ${tunnel.addr}`))
.catch((err) => console.log(err))
```

#### tls tunnel
```js
(async function(){

let tlsTunnel = await client.tls()
// or
let tlsTunnel = await client.tls({
    region: 'us', // us, ap or eu (default: us)
    to: '127.0.0.1:9090', // address to forward to (default: 127.0.0.1:8080) 
    subdomain: 'hello-world', // tunnel subdomain (default: random)
    reservedDomain: 'my.custom-domain.com', // reserved domain
    crt: '/path/to/cert.pem', // if you want localxpose client to terminate the tls connection
    key: '/path/to/key.pem', // if you want localxpose client to terminate the tls connection
    eventCallback: callback // tunnel events callback 
})
})()
// or
client.tls()
.then((tunnel) => console.log(`I am available on ${tunnel.addr}`))
.catch((err) => console.log(err))
```


#### tcp tunnel
```js
(async function(){
let tcpTunnel = await client.tcp()
// or
let tcpTunnel = await client.tcp({
    region: 'us', // us, ap or eu (default: us)
    to: '127.0.0.1:9090', // address to forward to (default: 127.0.0.1:8080) 
    port: 8181,  // choose a public port for your tunnel (default: random)
    reservedEndpoint: 'us-1.loclx.io:4444', // reserved endpoint
    eventCallback: callback // tunnel events callback 
})
})()
// or
client.tcp()
.then((tunnel) => console.log(`I am available on ${tunnel.addr}`))
.catch((err) => console.log(err))
```


#### udp tunnel
```js
(async function(){
let udpTunnel = await client.udp()
// or
let udpTunnel = await client.udp({
    region: 'us', // us, ap or eu (default: us)
    to: '127.0.0.1:9090', // address to forward to (default: 127.0.0.1:8080) 
    port: 8181,  // choose a public port for your tunnel (default: random)
    reservedEndpoint: 'us-1.loclx.io:4444', // reserved endpoint
    eventCallback: callback // tunnel events callback 
})
})()
// or
client.udp()
.then((tunnel) => console.log(`I am available on ${tunnel.addr}`))
.catch((err) => console.log(err))
```

#### file server tunnel
```js
(async function(){
let fileSrvTunnel = await client.fileServer({path: '/path/to/directory'})
// or
let fileSrvTunnel = await client.fileServer({
    region: 'us', // us, ap or eu (default: us)
    subdomain: 'fileserver', // tunnel subdomain (default: random)
    reservedDomain: 'reserved-fileserver.loclx.io', // reserved domain
    basicAuth: 'user:pass', // protect the tunnel with username and password
    path: '/path/to/directory', // path to be served
    eventCallback: callback // tunnel events callback 
})
})()
// or
client.fileServer({path: '/path/to/dir'})
.then((tunnel) => console.log(`I am available on ${tunnel.addr}`))
.catch((err) => console.log(err))
```

### close the tunnel
```js
let httpTunnel = await client.http()
await httpTunnel.close()
```

### close all the tunnels and kill LocalXpose process
```js
client.kill()
```

<br/>

# API
## LocalXpose Class
**new LocalXpose([accessToken])** - Initialization

* `accessToken`
    * Required: No (you can use access token stored in `LOCALXPOSE_ACCESS_TOKEN` environment variable)
    * A passed in accessToken will take precedence over an environment variable

### Methods

> #### Notes: 
> - *`http()`, `fileServer()`, `tls()`, `tcp()` and `udp()` methods return promises, the resolved result is object, either of type [`HlsTunnel`](#hlstunnel-class) or [`TupTunnel`](#tuptunnel-class)*
> - ***BOLD** option is mandatory*

* **http([options])** - create http tunnel, returns [`HlsTunnel`](#hlstunnel-class) object
    * `region` - can be 'us', 'ap' or 'eu' (default: 'us') 
    * `to` - address to forward to (default: 127.0.0.1:8080) 
    * `subdomain` - tunnel subdomain (default: random)
    * `reservedDomain` - reserved domain either custom domain or subdomain
    * `hostheader` - rewrite host header with a custom one
    * `basicAuth` - protect the tunnel with basic authentication in the form of `user:pass`
    * `eventCallback` - tunnel events callback, [see below](#event-callback)
    * *NOTE: if `reservedDomain` is supplied, `subdomain` and `region` are neglected*
* **fileServer(options)** - create a file server tunnel, returns [`HlsTunnel`](#hlstunnel-class) object
    * **`path` - path to be served**
    * `region` - can be 'us', 'ap' or 'eu' (default: 'us') 
    * `subdomain` - tunnel subdomain (default: random)
    * `reservedDomain` - reserved domain either custom domain or subdomain
    * `basicAuth` - protect the tunnel with basic authentication in the form of `user:pass`
    * `eventCallback` - tunnel events callback, [see below](#event-callback)
    * *NOTE: if `reservedDomain` is supplied, `subdomain` and `region` are neglected*
* **tls([options])** - create a TLS tunnel, returns [`HlsTunnel`](#hlstunnel-class) object
    * `region` - can be 'us', 'ap' or 'eu' (default: 'us') 
    * `to` - address to forward to (default: 127.0.0.1:8080) 
    * `subdomain` - tunnel subdomain (default: random)
    * `reservedDomain` - reserved domain either custom domain or subdomain
    * `crt` - tls certificate path
    * `key` - tls key path
    * `eventCallback` - tunnel events callback, [see below](#event-callback)
    * *NOTE: if `reservedDomain` is supplied, `subdomain` and `region` are neglected*
* **tcp([options])** - create tcp tunnel, returns [`TupTunnel`](#tuptunnel-class) object
    * `region` - can be 'us', 'ap' or 'eu' (default: 'us') 
    * `to` - address to forward to (default: 127.0.0.1:8080) 
    * `port` - public port for your tunnel (default: random)
    * `reservedEndpoint` - reserved endpoint
    * `eventCallback` - tunnel events callback, [see below](#event-callback)
    * *NOTE: if `reservedEndpoint` is supplied, `port` and `region` are neglected*
* **udp([options])** - create udp tunnel, returns [`TupTunnel`](#tuptunnel-class) object
    * `region` - can be 'us', 'ap' or 'eu' (default: 'us') 
    * `to` - address to forward to (default: 127.0.0.1:8080) 
    * `port` - public port for your tunnel (default: random)
    * `reservedEndpoint` - reserved endpoint
    * `eventCallback` - tunnel events callback, [see below](#event-callback)
    * *NOTE: if `reservedEndpoint` is supplied, `port` and `region` are neglected*
* **kill()** - close all the tunnels and stop LocalXpose process

<br/>

## HlsTunnel Class
*(HLS stands for HTTP/TLS)*
### Methods
* **close([options])** - close the tunnel, returns a promise
### Properties
* `ticket` - tunnel id
* `to` - address to forward to
* `proto` - protocol `http` or `tls`
* `addr` - the tunnel address (e.g. `hello-world.loclx.io`)
* `region` - tunnel region
* `status` - tunnel status `null`, `running`, `stopped` or `closed`
* `basicAuth` - username and password of the tunnel 
* `crt` -  tls certificate path (tls tunnels only)
* `key` -  tls key path (tls tunnels only)
* `hostheader` - host header value
* `path` - file server path

<br/>

## TupTunnel Class
*(TUP stands for TCP/UDP)*
### Methods
* **close([options])** - close the tunnel, returns a promise
### Properties
* `ticket` - tunnel id
* `to` - address to forward to
* `proto` - protocol `tcp` or `udp`
* `addr` - the tunnel address (e.g. `us-1.loclx.io:27002`)
* `region` - tunnel region
* `status` - tunnel status `null`, `running`, `stopped` or `closed`
* `hostname` - hostname (e.g. `us-1.loclx.io`)
* `port` -  public port number (e.g. `27002`)
 
<br/>

## Event Callback
Callback will be called for every event triggered by the tunnel.
```js
function callback(event,data)
```
### Argument `event` will be one of the follwoing

| Name        	| Description                                                     	                    |
|--------------	|-----------------------------------------------------------------------------------	|
| EVENT_RUNNING        	| Emitted when the tunnel is started successfully                    	                    |
| EVENT_RECONNECTING        	| Emitted when the connection is lost and trying to reconnect                  |
| EVENT_RECONNECTED     	| Emitted when the tunnel is reconnected successfully |
| EVENT_ERROR     	| Emitted when there is an error |
| EVENT_CLOSED | Emitted when the tunnel is closed |
| EVENT_MESSAGE        	| Emitted when there is a message (e.g. the forwarded address is unreachable) |

### Argument `data` will be as follow:
```js
{
    tunnel, // tunnel object (HlsTunnel or TupTunnel)
    msg, // message comming from the `EVENT_MESSAGE` event
    error // error object 
}
```


# Full Example

```javascript
const LocalXpose = require('localxpose')
const client = new LocalXpose('YOUR_ACCESS_TOKEN');

(async function(){
    let httpTunnel = await client.http({
        to: "127.0.0.1:4125",
        subdomain: "hello",
        eventCallback: callback
    })
    
     setTimeout(function () {
         httpTunnel.close()
     },10000)
})()



function callback(event,data){
    switch(event){
        case "EVENT_RUNNING":
            console.log(`tunnel ${data.tunnel.addr} is started`)
            break
        case "EVENT_ERROR":
            console.log(data.error)
            break
    }
}


```

# Development

### Setup
Run `npm install` inside the repository to install all the dev dependencies.

### Testing
Once all the dependencies are installed, you can execute the unit tests using `npm test`

### Contributing
[Guidelines for adding issues](docs/ADDING_ISSUES.md)


### ChangeLog

[See ChangeLog here](docs/CHANGELOG.md)

[LocalXpose URL]: https://localxpose.io