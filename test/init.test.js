const killTest  = require('./localxpose/kill.test')
const connectTest  = require('./localxpose/connect.test')
const httpTest  = require('./localxpose/http.test')
const tlsTest  = require('./localxpose/tls.test')
const tcpTest  = require('./localxpose/tcp.test')
const udpTest  = require('./localxpose/udp.test')
const fileServerTest  = require('./localxpose/fileserver.test')
const closeTest  = require('./tunnel/close.test')

describe("LocalXpose", function () {
    describe("connect",connectTest.bind(this))
    describe("#http()",httpTest.bind(this))
    describe("#tls()",tlsTest.bind(this))
    describe("#tcp()",tcpTest.bind(this))
    describe("#udp()",udpTest.bind(this))
    describe("#fileServer()",fileServerTest.bind(this))
    describe("#kill()",killTest.bind(this))
});


describe("Tunnel", function () {
    describe("#close()",closeTest.bind(this))
});
