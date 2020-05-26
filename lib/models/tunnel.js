const { Shared } = require("../shared")

class Tunnel {
    constructor ({ticket, to, proto,addr,region}) {
        this.ticket = ticket
        this.to = to
        this.proto = proto
        this.addr = addr
        this.region = region
        this.status = null
    }

    // close will return promise
    close(){
        return Shared.close(this.ticket)
    }
}

// HlsTunnel (HTTP/TLS = HLS)
class HlsTunnel extends Tunnel{
    constructor({ticket, to, proto,hostheader,addr,region,baiscAuth,crt,key,path}){
        super({ticket, to, proto,addr,region})
        this.basicAuth = baiscAuth
        this.crt = crt
        this.key = key
        this.hostheader = hostheader
        this.path = path
    }
}

// TupTunnel (TCP/UDP = TUP)
class TupTunnel extends Tunnel{
    constructor({ticket, to, proto,addr,region,hostname,port}){
        super({ticket, to, proto,addr,region})
        this.hostname = hostname
        this.port = port
    }
}


module.exports = {
    HlsTunnel,
    TupTunnel
}