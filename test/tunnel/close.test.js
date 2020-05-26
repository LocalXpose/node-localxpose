const chai = require("chai");
const expect = chai.expect;
const rootRequire = require('root-require')
const LocalXpose = rootRequire("lib");
const {TupTunnel} = rootRequire("lib/models/tunnel");


module.exports = function () {
    context("with running tunnel", function () {
        // close socket server after completing all the tests
        before(async function () {
            this._lx = await new LocalXpose(process.env.LOCALXPOSE_ACCESS_TOKEN)
            this._tunnel = await this._lx.http()
        })
        after(function () {
            this._lx.kill()
        })

        it("should be fulfilled", async function () {
            await expect(this._tunnel.close()).to.be.fulfilled;
        });

    });

    context("with stopped tunnel", function () {
        // close socket server after completing all the tests
        before(async function () {
            this._lx = await new LocalXpose(process.env.LOCALXPOSE_ACCESS_TOKEN)
            this._tunnel = await this._lx.tcp()
        })
        after(function () {
            this._lx.kill()
        })

        it("should be fulfilled", async function () {
            await this._tunnel.close()
            await expect(this._tunnel.close()).to.be.fulfilled;
        });
    });
}