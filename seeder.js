const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

//Load env vars
dotenv.config({ path: './config/config.env' });

//Load models
const Commnuity = require('./models/Community.js');
const Counter = require('./models/Counter.js');



//Connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});

//Read JSON Files
const initCommunity = JSON.parse(fs.readFileSync(`${__dirname}/_data/community.json`, 'utf-8'));
const initCounter = JSON.parse(fs.readFileSync(`${__dirname}/_data/counter.json`, 'utf-8'));

// Import into DB
// 1. init Community table structure
const importCommunityData = async () => {
    try {
        await Commnuity.create(initCommunity)
        console.log('Community Data Imported...'.green.inverse);
        process.exit();
    } catch (err) {
        console.error(err);
    }
}

//2. init Counter talbe structure
const importCounterData = async () => {
    try {
        await Counter.create(initCounter);
        console.log('Counter Data Imported...'.green.inverse);
        process.exit();
    } catch (err) {
        console.error(err);
    }
}

//Delete data
const deleteData = async () => {
    try {
        await Commnuity.deleteMany()
        console.log('Data Destroyed...'.red.inverse);
        process.exit();
    } catch (err) {
        console.error(err);
    }
}

if (process.argv[2] === '-import') {
    if (process.argv[3] === 'all') {
        importCommunityData();
        importCounterData()
    } else if (process.argv[3] === 'community') {
        importCommunityData()
    } else if (process.argv[3] === 'counter') {
        importCounterData()
    }

} else if (process.argv[2] === '-delete') {
    if (process.argv[3] === 'community') {
        deleteData();
    }

}