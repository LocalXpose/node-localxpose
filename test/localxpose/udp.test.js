const chai = require("chai")
const expect = chai.expect
const udp = require("dgram")
const rootRequire = require('root-require')
const LocalXpose = rootRequire("lib")
const {TupTunnel} = rootRequire("lib/models/tunnel")


module.exports = function () {
    context("with udp tunnel", function () {

        let udpServer = null
        before(function (done) {
            udpServer = udp.createSocket('udp4', function (msg, rinfo) {
                udpServer.send("Hello World", rinfo.port, rinfo.address)
            })

            udpServer.bind(5050, "127.0.0.1", function () {
                done()
            })
        })

        // close socket server after completing all the tests
        after(function (done) {
            udpServer.close()
            this._lx.kill()
            done()
        })

        it("should return instance of TupTunnel", async function () {
            this._lx = new LocalXpose(process.env.LOCALXPOSE_ACCESS_TOKEN)
            this._tunnel = await this._lx.udp({to: "5050"})
            expect(this._tunnel).to.be.an.instanceOf(TupTunnel)
        })


        it("should return 'Hello World' response when accessing the tunnel", function (done) {
            let client = udp.createSocket('udp4')
            let message = Buffer.from('echo')
            client.on('message', function (msg, info) {
                expect(msg.toString()).to.equal("Hello World")
                client.close()
                done()
            })

            client.send(message, this._tunnel.port, this._tunnel.hostname, (err) => {
                if (err) {
                    client.close()
                    done()
                }
            })
        })
    })
}