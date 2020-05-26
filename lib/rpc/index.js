const grpc = require('grpc')
const path = require('path')
const { execFile } = require('promisify-child-process')
const fs = require('fs')
const protoLoader = require('@grpc/proto-loader')
const processExists = require('process-exists')
const {PROCESS_NAME} = require('../constants')

const file = path.join(__dirname, 'proto','api.proto')
let packageDefinition = protoLoader.loadSync(
    file,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        objects: true,
        arrays: true,
        oneofs: true
    })

let protoDescriptor = grpc.loadPackageDefinition(packageDefinition)
let localxposeProto = protoDescriptor.api
const credentials = grpc.credentials.createSsl(
    fs.readFileSync(path.join(__dirname, 'cert.pem'))
)

let lxRPCExec
let lxRPCEnv = {
    env:{
        APP_ENV: process.env.NODE_ENV
    }
}
let lxRPCBinPath = path.join(__dirname,'..','..','bin' ,PROCESS_NAME)

function startRPC() {
    return new Promise((resolve,reject)=>{
        lxRPCExec = execFile(lxRPCBinPath,lxRPCEnv)
        lxRPCExec.catch((err)=>{
            reject(err)
        })
         lxRPCExec.stdout.on("data",function () {
             resolve()
         })
         lxRPCExec.stderr.on("data", err => {
             reject(err)
         })
    })
}

function stopRPC(){
    if (lxRPCExec)
        lxRPCExec.kill()
}


function isRunning(){
    return processExists(PROCESS_NAME)
}

module.exports = {
    TunnelService: new localxposeProto.Tunnel('localhost:54537', credentials),
    AuthService: new localxposeProto.Auth('localhost:54537', credentials),
    startRPC,
    isRunning,
    stopRPC
}

