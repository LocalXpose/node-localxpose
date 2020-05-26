const chai = require("chai")
const expect = chai.expect
const rootRequire = require('root-require')
const LocalXpose = rootRequire("lib")
const {HlsTunnel} = rootRequire("lib/models/tunnel")

module.exports = function () {
    context("with rpc is not running", function () {
        after(function () {
            this._lx.kill()
        })

        it("should return instance of HlsTunnel", async function () {
            this._lx = new LocalXpose()
            this._tunnel = await this._lx.http()
            expect(this._tunnel).to.be.an.instanceOf(HlsTunnel)
        })
    })

    context("with rpc is already running", function () {
        after(function () {
            this._lx.kill()
        })
        it("should return instance of HlsTunnel", async function () {
            this._lx = new LocalXpose(process.env.LOCALXPOSE_ACCESS_TOKEN)
            await this._lx.udp()
            await this._lx.tcp()
            this._tunnel = await this._lx.http()
            expect(this._tunnel).to.be.an.instanceOf(HlsTunnel)
        })
    })
}