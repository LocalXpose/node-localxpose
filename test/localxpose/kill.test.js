const chai = require("chai");
chai.use(require("chai-as-promised"));
const expect = chai.expect;
const rootRequire = require('root-require')
const LocalXpose = rootRequire("lib");


module.exports = function () {
    context("with running rpc process",function () {
        it("should not throw an error", async () => {
            let lxpInstance = await new LocalXpose(process.env.LOCALXPOSE_ACCESS_TOKEN)
            expect(lxpInstance.kill()).to.be.an('undefined')
        });
    })
}