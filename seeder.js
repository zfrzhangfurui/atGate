const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

//Load env vars
dotenv.config({ path: './config/config.env' });

//Load models
const Commnuity = require('./models/Community.js');
const Counter = require('./models/Counter.js');
const User = require('./models/User.js');
const Community = require('./models/Community.js');
const Member = require('./models/Member');
const Record = require('./models/Record');


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
const initMember = JSON.parse(fs.readFileSync(`${__dirname}/_data/member.json`, 'utf-8'));
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

//import member data

const importMemberData = async () => {
    // const memberLength = initMember.length;

    const communities = await Community.find();
    const community_length = communities.length;
    let count = 0;
    for (let memberOnEntry of initMember) {
        const i = await Counter.findOneAndUpdate({ name: 'memberAutoInc' }, { $inc: { seq: 1 } })
        const m_id = 10000 + i.seq;
        const member = await Member.create({ name: memberOnEntry.name, address: memberOnEntry.address, community_id: communities[count]._id, community: communities[count].community, m_id });
        const community = await Community.findById(communities[count]._id);
        community.member.push(
            member._id,
        )
        await community.save();
        count++;
        if (count >= community_length) {
            count = 0
        }
    }
}

// generate record data
const importRecordData = async (setType) => {
    const createdBy = '5f2cbee50cdbffa20018725d';
    const community_id = '5f3bd850a35e5699ea5a338f';
    const members = await Member.find({ community_id });
    console.log(members[0]._id);

    function getRandomInt(max) {
        let number = Math.floor(Math.random() * Math.floor(max));
        number > 0 ? true : number = 1;
        return number;
    }
    function getRandomDate() {
        const year = (2000 + getRandomInt(21)).toString();
        const month = getRandomInt(13).toString();
        const day = getRandomInt(28).toString();
        return `${year}-${month}-${day}`;
    }
    // console.log(getRandomDate().green.inverse);
    for (let member of members) {
        for (let i = 0; i < 10; i++) {
            const name = member.name;
            const member_id = member._id;
            let transfer, p, c, g;
            if (setType) {
                transfer = getRandomInt(2000);
                p = Math.floor(transfer * 0.7);
                c = transfer - p;
                g = getRandomInt(1000);
            } else {
                p = getRandomInt(1000);
                transfer = p;
                c = 0;
                g = 0;
            }

            const type = setType;
            const createdAt = getRandomDate();
            const record = await Record.create({ name, member_id, transfer, p, c, g, type, createdAt, createdBy, community_id });
            if (record) {
                console.log(name.green.inverse, member_id.green, createdAt.green.inverse);
            }
        }
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
    } else if (process.argv[3] === 'member') {
        importMemberData();
    } else if (process.argv[3] === 'record') {
        importRecordData(true);
    }

} else if (process.argv[2] === '-delete') {
    if (process.argv[3] === 'community') {
        deleteData();
    }

}