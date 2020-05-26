const chai = require("chai")
chai.use(require("chai-as-promised"))
const expect = chai.expect
const rootRequire = require('root-require')
const LocalXpose = rootRequire("lib")
const {HlsTunnel} = rootRequire("lib/models/tunnel")

module.exports = function () {
    context("without access token (guest)", function () {
        after(function () {
            this._lx.kill()
        })

        it("should return instance of HlsTunnel", async function () {
            this._lx = new LocalXpose()
            this._tunnel = await this._lx.http()
            expect(this._tunnel).to.be.an.instanceOf(HlsTunnel)
        })
    })

    context("with valid access token", function () {
        after(function () {
            this._lx.kill()
        })
        it("should return instance of HlsTunnel", async function () {
            this._lx = new LocalXpose(process.env.LOCALXPOSE_ACCESS_TOKEN)
            this._tunnel = await this._lx.http()
            expect(this._tunnel).to.be.an.instanceOf(HlsTunnel)
        })
    })

    context("with invalid access token", function () {
        it("should throw an error", async function () {
            this._lx = new LocalXpose("fake access token")
            await expect(this._lx.http()).to.eventually.be.rejectedWith({
                "code": 4000,
                "errors": "",
                "msg": "Unauthoraized"
            })
        })
    })
}