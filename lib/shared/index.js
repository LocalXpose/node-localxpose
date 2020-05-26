const lxRPC = require("../rpc")


class Shared {
    static close(ticket){
        return new Promise((resolve, reject) => {
            lxRPC.TunnelService.StopTunnel({ticket}, function (err, resp) {
                if (resp.error) {
                    return reject(resp.error)
                } else if (err) {
                    return reject(err)
                }
                return resolve(resp)
            })
        })
    }
}


module.exports = {
    Shared
}