const { DownloaderHelper } = require('node-downloader-helper')
const os = require('os')
const path = require('path')
const cliProgress = require('cli-progress')
const fsExtra = require('fs-extra')
const {PROCESS_NAME} = require('../constants')
const DecompressZip = require('decompress-zip')


function getArch() {
    switch (os.arch()) {
        case 'arm':
            return 'arm'
        case 'arm64':
            return 'arm64'
        case 'ia32':
        case 'x32':
            return '386'
        case 'x64':
            return 'amd64'
        default:
            return null
    }
}

function getOS(){
    switch (os.platform()) {
        case "darwin":
            return 'darwin'
        case "linux":
        case "freebsd":
        case "openbsd":
            return 'linux'
        case "win32":
            return 'windows'
        default:
            return null
    }
}


function unzipFile(options){
    let unzipper = new DecompressZip(path.join(options.directory,options.filename))

    unzipper.on('error', function (err) {
        console.log('Error: ',err)
    })

    // once extracted chmod the file
    unzipper.on('extract', function () {
        fsExtra.chmodSync(path.join(options.directory,options.execFileName), 0o755)
    })


    unzipper.extract({
        path: options.directory,
    })
}


// return promise
module.exports = function download() {
    let arch = getArch()
    let platform = getOS()
    if (!arch || !platform) {
        console.log(`${os.platform()}-${os.arch()} is not supported`)
        return
    }

    // downloader options
    let options = {
        directory:  'bin', // where to store the downloaded data
        execFileName: PROCESS_NAME,
        filename: `lxrpc-${platform}-${arch}.zip` // filename to be downloaded
    }


    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)

    if (fsExtra.existsSync(path.join(options.directory,options.execFileName)) && !process.env.REFRESH) {
        return
    }

    // if directory not exists then create one
    fsExtra.ensureDirSync(options.directory)
    fsExtra.emptyDirSync(options.directory)

    let url = `https://localxpose.io/rpc/${options.filename}`
    if (process.env.NODE_ENV === 'dev' ) url = `http://127.0.0.1:8090/rpc/${options.filename}`
    const dl = new DownloaderHelper(url, options.directory, {
        retry: { maxRetries: 3, delay: 2000 }
    })

    dl.on('start',() => {
        console.log('Start Downloading LocalXpose...')
        bar.start(100, 0)
    })

    dl.on('error', (err)=> console.log(`Error: ${err.message}`))

    dl.on('end', () => {
        bar.stop()
        console.log('Done.')
        unzipFile(options)
    })

    dl.on('progress', (stats)=>bar.update(stats.progress))
    dl.on('stateChanged', (state)=>{
        switch (state) {
            case 'paused':
            case 'stopped':
            case 'failed':
                bar.stop()
                break
        }
    })
    return dl.start()
}