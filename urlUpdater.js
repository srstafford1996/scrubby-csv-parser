const fs = require('fs')
const axios = require('axios');
const path = require('path');
const JSON_DIR = path.join(__dirname, 'json');


const jsonFiles = fs.readdirSync(JSON_DIR).filter(dir => dir.includes('.json'))

gifNameGetter = async (previewUrl) => {

    const gifName = previewUrl.split('/')[3].replace('.gif', '');

    try {
        let result = await axios.get(`https://api.gfycat.com/v1test/gfycats/${gifName}`)
        const giantResult = `https://giant.gfycat.com/${result.data.gfyItem.gfyName}.gif`
        return giantResult;
    } catch (error) {
        gifNameGetter(previewUrl)
    }

}


const updateMoveList = async (data, path) => {
    const updatedMoveList = Promise.all(data.movelist.map(async (move) => {
        if (move.preview_url !== null) {
            let result = await gifNameGetter(move.preview_url)
            move.preview_url = result;
            return move;
        }

        if (move.preview_url === null) {
            return move
        }
    }))

    data.movelist = await updatedMoveList;

    fs.writeFile(path, JSON.stringify(data, null, 2), 'utf8', (err) => {
        if (err) throw err;
    })

}

jsonFiles.forEach(file => {
    console.log(file)
    fs.readFile(`./json/${file}`, 'utf8', (err, data) => {
        if (err) throw err;
        updateMoveList(JSON.parse(data), `./json/${file}`)
    })

})


