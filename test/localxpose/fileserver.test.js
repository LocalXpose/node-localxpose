const fs = require('fs')
const chai = require("chai")
const expect = chai.expect
const axios = require('axios')
const rootRequire = require('root-require')
const LocalXpose = rootRequire("lib")
const {HlsTunnel} = rootRequire("lib/models/tunnel")

module.exports = function () {
    context("with fileserver", function () {
        before(() => {
            fs.mkdirSync("public")
            fs.writeFileSync("public/index.html", "Hello World")
        })

        after(() => {
            fs.unlinkSync("public/index.html")
            fs.rmdirSync("public", {recursive: true})
        })


        it("should return instance of HlsTunnel", async function () {
            this._lx = new LocalXpose(process.env.LOCALXPOSE_ACCESS_TOKEN)
            this._tunnel = await this._lx.fileServer({
                path: "./public"
            })
            expect(this._tunnel).to.be.an.instanceOf(HlsTunnel)
        })


        it("should return 'Hello World' response when accessing the tunnel", async function () {
            let url = "http://" + this._tunnel.addr
            let response = await axios.get(url)
            expect(response.data).to.equal("Hello World")
            this._lx.kill()
        });
    });
}