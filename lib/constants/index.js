const os = require('os')
// tunnel events
const TUNNEL_EVENTS = Object.freeze({
        RUNNING: 'EVENT_RUNNING',
        RECONNECTING: 'EVENT_RECONNECTING',
        RECONNECTED: 'EVENT_RECONNECTED',
        ERROR: 'EVENT_ERROR',
        CLOSED: 'EVENT_CLOSED',
        MESSAGE: 'EVENT_MESSAGE',
    })
// tunnel status
const TUNNEL_STATUS = Object.freeze({
        RUNNING: 'running',
        STOPPED: 'stopped',
        CLOSED: 'closed',
    })
const PROCESS_NAME = (os.platform() === 'win32') ? 'lxrpc.exe' : 'lxrpc'

module.exports = {
    TUNNEL_STATUS,
    TUNNEL_EVENTS,
    PROCESS_NAME
}