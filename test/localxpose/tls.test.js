const chai = require("chai")
const expect = chai.expect
const serverMock = require("mock-http-server")
const axios = require('axios')
const fs = require('fs')
const rootRequire = require('root-require')
const LocalXpose = rootRequire("lib");
const {HlsTunnel} = rootRequire("lib/models/tunnel")
const https = require('https')
const selfsigned = require('selfsigned')

module.exports = function () {
    describe("with tls tunnel", function() {
        let server = new serverMock({
            host: "127.0.0.1",
            port: 8843 });

        before(function(done) {
            let attrs = { name: 'localhost', value: 'localhost.com' }
            let pems = selfsigned.generate(attrs,{days: 365})
            fs.mkdirSync("public")
            fs.writeFileSync("public/cert.crt", pems.cert)
            fs.writeFileSync("public/key.key", pems.private)
            server.start(done);
        });

        after(function(done) {
            fs.unlinkSync("public/cert.crt")
            fs.unlinkSync("public/key.key")
            fs.rmdirSync("public", {recursive: true})
            server.stop(done);
            this._lx.kill()
        });

        it("should return instance of HlsTunnel", async function() {
            this._lx = new LocalXpose(process.env.LOCALXPOSE_ACCESS_TOKEN)
            this._tunnel = await this._lx.tls({
                to: "8843",
                key: "./public/key.key",
                crt: "./public/cert.crt"
            })
            expect(this._tunnel).to.be.an.instanceOf(HlsTunnel)
        });


        it("should return 'Hello World' response when accessing the tunnel", async function() {
            server.on({
                method: 'GET',
                path: '/',
                reply: {
                    status:  200,
                    headers: { "content-type": "application/json" },
                    body:    "Hello World"
                }
            });

            let url = "https://"+this._tunnel.addr
            const agent = new https.Agent({
                rejectUnauthorized: false
            });
            let response = await axios.get(url,{httpsAgent:agent})
            expect(response.data).to.equal("Hello World")
        });
    });

}