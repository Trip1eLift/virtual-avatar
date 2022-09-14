const fs = require('fs');

function randomIntGenerator(max, length) {
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    let list = new Int32Array(length);
    for (let i = 0; i < length; i++) {
        list[i] = getRandomInt(max);
    }

    let fileBuffer = "[\n";
    for (let i = 0; i < length - 1; i++) {
        fileBuffer = fileBuffer + "  " + list[i] + ",\n";
    }
    fileBuffer = fileBuffer.substring(0, fileBuffer.length - 2) + "\n";
    fileBuffer = fileBuffer + "]";
    fs.writeFileSync("./src/facemesh/randomInt.json", fileBuffer, "utf-8");
}

randomIntGenerator(3, 1704);