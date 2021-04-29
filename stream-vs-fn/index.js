const fs = require('fs');

const file = './files/electric-bulb.mp4';

// Bad : we wait reading before write

console.time('bad');

fs.readFile(file, (err, data) => {
    if (err) {}
    fs.writeFile('./copies/electric-bulb.mp4', data, (err) => {
        if (err) {}
        console.timeEnd('bad');
        console.log('Writing file ended');
    });
});

// Good : we write sequentially

console.time('good');

const read = fs.createReadStream(file);
const write = fs.createWriteStream('./copies/electric-bulb-2.mp4');

//read.on('data', (chunk) => {});

read.pipe(write);

read.on('end', () => {
    console.timeEnd('good');
});

// With counter

/*
console.time('good');

fs.stat(file, (err, stats) => {

    let progress = 0;

    const read = fs.createReadStream(file);
    const write = fs.createWriteStream('./copies/electric-bulb-2.mp4');

    read.on('data', (chunk) => {
        progress += chunk.length;
        // console.log(`Progress: ${Math.round( ( 100 * progress ) / stats.size)} %`);
    });

    read.pipe(write);

    read.on('end', () => {
        console.timeEnd('good');
        console.log('File reading ended');
    });

});
*/