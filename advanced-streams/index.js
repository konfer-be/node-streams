/**
 * Stream = data stream of unknow size, accessible by chunks
 * Buffer = block of data of know size, synchronously accessible
 * 
 * Buffer + EventEmitter = Stream
 */

/**
 * Buffer = container in which is stored data on bynary format. As bytes array.
 */

const string = 'vidéo';
const buffer = Buffer.from(string, 'utf-8');
const bytes = Array.from(buffer.values());
const string2 = Buffer.from(bytes).toString();

console.log(string.length); // 5
console.log(buffer.length); // 6
console.log(buffer.values()); // Object [Array Iterator]
console.log(bytes); // [ 118, 105, 100, 195, 169, 111 ]
console.log(string === string2); // true

/**
 * Event.Emitter: Node.js event-driven based
 */

const { EventEmitter } = require('events');

const emitter = new EventEmitter();

emitter.on('test', (data) => {
    console.log('test event received with ', data);
});

emitter.emit('test', { data: 'Hello world' } );

/**
 * ReadableCounter
 */

const { Readable } = require('stream');

class ReadableCounter extends Readable {

    constructor(highWaterMark = 16000) {
        super({ highWaterMark });
    }

    data = 0;

    /**
     * @override called when consumer list data|readable or call resume(). Paused when highWaterMark limit is passed
     */
    _read() {
        try {
            this.data += 1;
            if (this.data <= 6) {
                this.push(this.data.toString());
            } else {
                this.push(null);
            }
        } catch(e) {
            this.emit('error', e);
        }
    }
}

// Mode flowing -> as similary to websockets push notifications

const readable = new ReadableCounter();

console.log(readable.isPaused()); // false

readable.on('data', (chunk) => {
    // Do with chunk...
    console.log('chunk from data...', chunk);
});

readable.on('error', (err) => {
    console.log('Error while reading: ', e.message);
});

// readable.resume();

console.log(readable.isPaused()) // false

// Mode paused -> as similary to pooling on REST API

const readable2 = new ReadableCounter();

console.log(readable2.isPaused()); // false

readable2.on('readable', () => {
    let chunk;
    // Do with chunk...
    while((chunk = readable2.read()) !== null) {
        console.log('chunk from internal buffer...', chunk);
    }
});

console.log(readable2.isPaused()) // true

/**
 * WritableLogger
 */

const logUpdate = require('log-update');
const { Writable } = require('stream');

class WritableLogger extends Writable {

    /**
     * @override called when consumer call write() or end()
     * 
     * @param {*} chunk 
     * @param {*} encoding 
     * @param {*} next 
     */
    _write(chunk, encoding, next) {
        try {
            logUpdate(`length=${this.writableLength} chunk=${chunk}`);
            next();
        } catch(e) {
            this.emit('error', e); // || next(e)
        }
    }
}

const writable = new WritableLogger();

writable.on('error', (err) => {
    console.log('Error while writing ', e.message);
});

let data = 0;

const feedStream = () => {
    data += 1;
    if (data <= 6) {
        const isWritable = writable.write(data.toString());
        if (isWritable) {
            setTimeout(feedStream, 50);
        } else {
            writable.once('drain', feedStream);
        }
    } else {
        writable.end(data.toString());
    }
}

feedStream();

/**
 * Classic pipe
 */

readable.pipe(writable);

readable.on('error', (err) => console.error(err.message));
writable.on('error', (err) => console.error(err.message));

// readable.pipe(writable).on('error', (err) => console.log(err.message)) display only readable error;

/**
 * Pipeline
 */

const { pipeline } = require('stream');

pipeline(readable, writable, (err) => {
    if(err) {
        console.log('Error in pipeline ', err.message);
    }
});

/**
 * Workshop : optimize big file reading on HTTP server
 */

const { createReadStream, readFile } = require('fs');
const { createServer } = require('http');

const server = createServer( (req, res) => {
    if (req.url === '/') {
        createReadStream('./files/electric-bulb-1.mp4').pipe(res);
    } else {
        res.end();
    }
});

server.listen(8080);

const server2 = createServer( (req, res) => {
    if (req.url === '/') {
        readFile('./files/electric-bulb-2.mp4', (err, data) => res.end(data));
    } else {
        res.end();
    }
});

server2.listen(8081);