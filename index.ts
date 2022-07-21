import { mongoDBcollection, landlordID, commandList, selfID } from './constants';
import { SplitArgsWithCommand, RandomFt } from './bin/util';
import { scheduleReset, reset } from './bin/cron';
import * as dotenv from 'dotenv';
import * as Discord from 'discord.js';
import * as mongo from 'mongodb';
import express from 'express';
import { showTenants, work, buy, goStudy, howAreYou, sigh } from './bin/commands/tenants';
import { gamble, slots } from './bin/commands/gambling';
import { movein, evict, upgrade, downgrade, roleSetup, roleCleanup } from './bin/commands/landlord';
import { createTenant, alterData } from './bin/mongo';
const { exec } = require("child_process");

dotenv.config();

const APP = express();
const PORT: number = 3000;

APP.get('/', (req: any, res: any) => {
    console.log("Get request");
    res.send('Square Footage Bot!')
});
APP.listen(PORT, () => console.log(`Closet bot app listening at http://localhost:${PORT}`));

const client = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        // Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS
        // Discord.Intents.FLAGS.GUILD_VOICE_STATES,
    ],
}); // Client requires one parameter, which is intents.

if (!client) {
    throw new Error("Client is undefined");
} else {

}

if (client && client.options && client.options.http) {
    client.options.http.api = "https://discord.com/api"; // Avoid 429 Status: https://support.glitch.com/t/discord-bot-not-connecting-or-429-status-code/28349
} else {
    throw new Error("Something unexpected happened with the client options")
}

// MongoDB client
const mongoclient = new mongo.MongoClient(process.env.MONGO_DB_CONNECTION!); // Use the ! for non null assertion operator: https://stackoverflow.com/questions/54496398/typescript-type-string-undefined-is-not-assignable-to-type-string

// Connect to MongoDB, you only have to do this once at the beginning
const MongoConnect = async () => {
    try {
        await mongoclient.connect()
    } catch (e) {
        console.error(e);
    }
}

MongoConnect();

client.on("ready", () => {
    console.log(`Logged in as ${client.user?.tag}!`); // Use ? to enable this to be undefined: https://stackoverflow.com/questions/37632760/what-is-the-question-mark-for-in-a-typescript-parameter-name
});

// Queue up the job refreshing
scheduleReset(mongoclient);

// message
client.on('messageCreate', async (msg: Discord.Message) => {
    // console.log(msg.content);
    // console.log(msg.author);
    // console.log(ParseMention(msg.content));
    // prevent the bot from listening to itself and to make sure each and every text starts with ! as a command
    if (msg.author.id !== selfID && msg.content.at(0) === "!") {
        const channel = client.channels.cache.get(msg.channelId) as Discord.TextChannel;
        if (msg.content === "!tenants") {
            showTenants(mongoclient, channel);
        } else if (msg.content === "!work") {
            work(mongoclient, channel, msg)
        } else if (msg.content.includes("!gamble")) {
            gamble(mongoclient, channel, msg);
        } else if (msg.content.includes("!slots")) {
            slots(mongoclient, channel, msg);
        } else if (msg.content.includes("!buy")) {
            buy(mongoclient, channel, msg)
        } else if (msg.content.includes("!gostudy")) {
            goStudy(mongoclient, msg, channel);
        } else if (msg.content === "!howareyou") {
            howAreYou(mongoclient, msg, channel);
        } else if (msg.content.includes("!sigh")) {
            sigh(mongoclient, msg, channel);
        } else if ((msg.content.toLowerCase()).includes("i love life")) {
            channel.send(":cross:  Live  :cross:    :rofl:  Laugh :rofl:    :heart:  Love :heart:");
        } else if (msg.author.id === landlordID) {
            let closet = await mongoclient.db().collection(mongoDBcollection);
            // only the landlord has full control of this bot
            if (msg.content.includes("!movein")) {
                movein(closet, channel, msg);
            } else if (msg.content.includes("!evict")) {
                evict(closet, channel, msg);
            } else if (msg.content.includes("!upgrade")) {
                upgrade(closet, channel, msg);
            } else if (msg.content.includes("!downgrade")) {
                downgrade(closet, channel, msg);
            } else if (msg.content.includes("!ft")) {
                // ft(closet, channel, msg);
                alterData(closet, channel, msg, "square feet");
            } else if (msg.content.includes("!money")) {
                alterData(closet, channel, msg, "money");
            } else if (msg.content === "!resethourly") {
                reset(mongoclient);
                channel.send("Labor and gambling should have been reset! Everyone should be able to work and gamble again.");
            } else if (msg.content === "!rolesetup") {
                // create all the roles needed
                if (msg.guild) {
                    roleSetup(msg.guild, channel);
                } else {
                    console.error("msg.guild is undefined when setting up roles");
                }
            } else if (msg.content === "!rolecleanup") {
                if (msg.guild) {
                    roleCleanup(msg.guild);
                } else {
                    console.error("msg.guild is undefined when cleaning up roles");
                }
            }
        } else if (commandList.includes(SplitArgsWithCommand(msg.content).shift() as string) && msg.author.id !== landlordID) {
            // DEDUCT SQUARE FEET
            const id = msg.author.id;
            let closet = await mongoclient.db().collection("closet");
            let someCursor = await closet.findOne({ id: id });
            if (!someCursor) {
                // forcibly move them in
                await createTenant(closet, msg.author.id, msg.author.username);
                channel.send(`${msg.author.username} has been forcibly moved into the closet!`)
                someCursor = await closet.findOne({ id: id }); // try to find again
            }

            if (someCursor) {
                // deduct square feet
                const decrease = RandomFt(5);
                const newFootage = parseFloat((someCursor.ft - decrease).toFixed(5));
                await closet.updateOne({ id: id }, {
                    $set: {
                        ft: newFootage
                    }
                });
                channel.send(`**HEY YOU! YOU AREN'T THE LANDLORD!** <@${landlordID}>!! This is an **illegal** move by ${someCursor.name}.\n\n**${someCursor.name}** now has **${newFootage} ft^2** now. That's a **${decrease} decrease** in ft^2. Serves you right.`);
            }
        }
    }
});

// debug
client.on('debug', debug => {
    console.log(debug);
    if (debug.includes("429")) { // 429 is a rate limit, kill replit if it is rate limited
        exec("kill 1");
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);

/**
 * Future features
 * - fixed price for slots
 * - fix integer gambling
 * - fancy animation for slots and coin flip
 * - Rent (?)
 * - Trading square feet for money and vice versa
 * - Donating money and/or square feet
 * - !$$$ money giving command for landlord (refactor code to be identical to the !ft)
 * - cleanup of gambling messages
 */