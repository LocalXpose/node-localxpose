const lxRPC = require("./rpc")
const Tunnel = require("./models/tunnel")
const constants = require("./constants")

// private fields
let _accessToken = new WeakMap()
let _loggedIn = new WeakMap()

class LocalXpose {
    constructor(accessToken) {
        if (accessToken) _accessToken.set(this, accessToken)
        else if(process.env.LOCALXPOSE_ACCESS_TOKEN) _accessToken.set(this, process.env.LOCALXPOSE_ACCESS_TOKEN)
        _loggedIn.set(this, false)
    }

    kill() {
        lxRPC.stopRPC()
    }

    fileServer({
                   region,
                   subdomain,
                   reservedDomain,
                   path,
                   basicAuth,
                   eventCallback
               } = {}) {
        if (!path){
            throw new Error("file server path is required")
        }
        return connect.bind(this)({
            proto: 'http',
            region,
            subdomain,
            reservedDomain,
            fileServerPath: path,
            basicAuth,
            eventCallback
        })
    }

    // http/https
    http({
             region,
             to,
             subdomain,
             reservedDomain,
             hostheader,
             basicAuth,
             eventCallback
         } = {}) {

        return connect.bind(this)({
            proto: 'http',
            region,
            to,
            subdomain,
            reservedDomain,
            hostheader,
            basicAuth,
            eventCallback
        })
    }

    tls({
            region,
            to,
            subdomain,
            reservedDomain,
            crt,
            key,
            eventCallback
        } = {}) {

        return connect.bind(this)({
            proto: 'tls',
            region,
            to,
            subdomain,
            reservedDomain,
            crt,
            key,
            eventCallback
        })
    }

    tcp({
            region,
            to,
            reservedEndpoint,
            port,
            eventCallback
        } = {}) {

        return connect.bind(this)({
            proto: 'tcp',
            region,
            to,
            reservedEndpoint,
            port,
            eventCallback
        })
    }

    udp({
            region,
            to,
            reservedEndpoint,
            port,
            eventCallback
        } = {}) {

        return connect.bind(this)({
            proto: 'udp',
            region,
            to,
            reservedEndpoint,
            port,
            eventCallback
        })
    }
}

async function connect({
                           proto,
                           region,
                           to,
                           subdomain,
                           reservedDomain,
                           hostheader,
                           basicAuth,
                           fileServerPath,
                           crt,
                           key,
                           reservedEndpoint,
                           port,
                           eventCallback
                       } = {}) {

    try {
        // check if rpc process is running
        if (!await lxRPC.isRunning()) {
            await lxRPC.startRPC()
        }
        // try to login if access token is provided
        if (!_loggedIn.get(this) && _accessToken.get(this)) {
            await login(_accessToken.get(this))
            _loggedIn.set(this, true)
        }
    } catch (e) {
        // stop the rpc
        this.kill()
        throw e
    }

    return new Promise((resolve, reject) => {
        let stream = null
        let tunnel = null
        switch (proto) {
            case "http":
            case "tls":
                stream = lxRPC.TunnelService.HlsTunnel({
                    to,
                    region,
                    type: proto,
                    subdomain,
                    reservedDomain,
                    fileServer: fileServerPath,
                    hostheader,
                    basicAuth,
                    crt,
                    key
                })
                tunnel = new Tunnel.HlsTunnel({})
                break
            case "tcp":
            case "udp":
                stream = lxRPC.TunnelService.TupTunnel({
                    to,
                    region,
                    type: proto,
                    reservedEndpoint,
                    port
                })
                tunnel = new Tunnel.TupTunnel({})
                break
            default:
                reject(new Error("unsupported protocol"))
        }

        stream.on("data", function (resp) {
            switch (resp.event) {
                case constants.TUNNEL_EVENTS.ERROR:
                    if (resp.error) {
                        if (resp.error.errors)
                            resp.error.msg = resp.error.msg.concat(" -> ", resp.error.errors)
                        reject(resp.error)
                    }
                    break

                case constants.TUNNEL_EVENTS.RUNNING:
                    if (tunnel instanceof Tunnel.HlsTunnel) {
                        Object.assign(tunnel, {
                            ticket: resp.tunnel.ticket,
                            to: resp.tunnel.to,
                            proto: resp.tunnel.type,
                            addr: resp.tunnel.addr,
                            region: resp.tunnel.region,
                            basicAuth: resp.tunnel.hlsTunnel.basicAuth,
                            hostheader: resp.tunnel.hlsTunnel.hostheader,
                            crt: crt,
                            key: key,
                            path: resp.tunnel.hlsTunnel.fileServerPath,
                            status: constants.TUNNEL_STATUS.RUNNING
                        })
                    } else if (tunnel instanceof Tunnel.TupTunnel) {
                        Object.assign(tunnel, {
                            ticket: resp.tunnel.ticket,
                            to: resp.tunnel.to,
                            proto: resp.tunnel.type,
                            addr: resp.tunnel.addr,
                            region: resp.tunnel.region,
                            hostname: resp.tunnel.tupTunnel.hostname,
                            port: resp.tunnel.tupTunnel.port,
                            status: constants.TUNNEL_STATUS.RUNNING
                        })
                    }
                    resolve(tunnel)
                    break

                case constants.TUNNEL_EVENTS.RECONNECTED:
                    Object.assign(tunnel, {
                        ticket: resp.tunnel.ticket,
                        region: resp.tunnel.region,
                        addr: resp.tunnel.addr,
                        status: constants.TUNNEL_STATUS.RUNNING
                    })
                    break

                case constants.TUNNEL_EVENTS.RECONNECTING:
                    Object.assign(tunnel, {
                        status: constants.TUNNEL_STATUS.STOPPED
                    })
                    break

                case constants.TUNNEL_EVENTS.CLOSED:
                    Object.assign(tunnel, {
                        status: constants.TUNNEL_STATUS.CLOSED
                    })
                    break
            }

            // call eventCallback if it is provided
            if (eventCallback && typeof eventCallback === 'function') {
                eventCallback(resp.event, {
                    tunnel: (tunnel.ticket) ? tunnel : null,
                    msg: resp.msg,
                    error: resp.error
                })
            }
        })

        stream.on("error", function (error) {
            if (eventCallback && typeof eventCallback === 'function') {
                if (error.code === 14) {
                    error.msg = "cannot connect to the rpc"
                } else {
                    error.msg = error.details
                    delete error.details
                }

                eventCallback(constants.TUNNEL_EVENTS.ERROR, {
                    tunnel: (tunnel.ticket) ? tunnel : null,
                    msg: null,
                    error: error
                })
            }
        })

    })
}

function login(accessToken) {
    return new Promise((resolve, reject) => {
        lxRPC.AuthService.Login({accessToken}, function (err, resp) {
            if (err) {
                return reject(err)
            } else if (resp && resp.error) {
                return reject(resp.error)
            }

            return resolve()
        })
    })
}

module.exports = LocalXpose


