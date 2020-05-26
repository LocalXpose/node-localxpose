const chai = require("chai")
const expect = chai.expect
const serverMock = require("mock-http-server")
const axios = require('axios')
const rootRequire = require('root-require')
const LocalXpose = rootRequire("lib")
const {HlsTunnel} = rootRequire("lib/models/tunnel")

module.exports = function () {
    context("with http tunnel", function() {
        let server = new serverMock({ host: "127.0.0.1", port: 8080 })
        before(function(done) {
            server.start(done)
        })

        after(function(done) {
            this._lx.kill()
            server.stop(done)
        })

        it("should return HlsTunnel instance", async function() {
            this._lx = new LocalXpose(process.env.LOCALXPOSE_ACCESS_TOKEN)
            this._tunnel = await this._lx.http()
            expect(this._tunnel).to.be.an.instanceOf(HlsTunnel)
        })


        it("should return 'Hello World' response when accessing the tunnel", async function() {
            server.on({
                method: 'GET',
                path: '/',
                reply: {
                    status:  200,
                    headers: { "content-type": "application/json" },
                    body:    "Hello World"
                }
            })

            let url = "http://"+this._tunnel.addr
            let response = await axios.get(url)
            expect(response.data).to.equal("Hello World")
        })
    })
}