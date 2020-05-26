const chai = require("chai")
const expect = chai.expect
const net = require("net")
const rootRequire = require('root-require')
const LocalXpose = rootRequire("lib")
const {TupTunnel} = rootRequire("lib/models/tunnel")

module.exports = function () {
    context("with tcp tunnel", function () {
        before(function (done) {
            this._tcpServer = net.createServer(function (socket) {
                socket.end('Hello World')
            }).listen(4040, '127.0.0.1', function () {
                done()
            })
        })

        // close socket server after completing all the tests
        after(function (done) {
            this._tcpServer.close()
            this._lx.kill()
            done()
        })

        it("should return instance of TupTunnel", async function () {
            this._lx = new LocalXpose(process.env.LOCALXPOSE_ACCESS_TOKEN)
            this._tunnel = await this._lx.tcp({to: "127.0.0.1:4040"})
            expect(this._tunnel).to.be.an.instanceOf(TupTunnel)
        })


        it("should return 'Hello World' response when accessing the tunnel", function (done) {
            let client = new net.Socket()
            client.connect(this._tunnel.port, this._tunnel.hostname).once("data", (chunk) => {
                expect(chunk.toString()).to.equal("Hello World")
                client.end()
                done()
            }).on("error", done)
        })
    })
}