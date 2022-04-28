"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const util_1 = require("./bin/util");
const cron_1 = require("./bin/cron");
const dotenv = __importStar(require("dotenv"));
const Discord = __importStar(require("discord.js"));
const mongo = __importStar(require("mongodb"));
const express_1 = __importDefault(require("express"));
const commands_1 = require("./bin/commands");
const { exec } = require("child_process");
dotenv.config();
const APP = (0, express_1.default)();
const PORT = 3000;
APP.get('/', (req, res) => {
    console.log("Get request");
    res.send('Square Footage Bot!');
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
}
else {
}
if (client && client.options && client.options.http) {
    client.options.http.api = "https://discord.com/api"; // Avoid 429 Status: https://support.glitch.com/t/discord-bot-not-connecting-or-429-status-code/28349
}
else {
    throw new Error("Something unexpected happened with the client options");
}
// MongoDB client
const mongoclient = new mongo.MongoClient(process.env.MONGO_DB_CONNECTION); // Use the ! for non null assertion operator: https://stackoverflow.com/questions/54496398/typescript-type-string-undefined-is-not-assignable-to-type-string
// Connect to MongoDB, you only have to do this once at the beginning
const MongoConnect = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoclient.connect();
    }
    catch (e) {
        console.error(e);
    }
});
MongoConnect();
client.on("ready", () => {
    var _a;
    console.log(`Logged in as ${(_a = client.user) === null || _a === void 0 ? void 0 : _a.tag}!`); // Use ? to enable this to be undefined: https://stackoverflow.com/questions/37632760/what-is-the-question-mark-for-in-a-typescript-parameter-name
});
// Queue up the job refreshing
(0, cron_1.scheduleReset)(mongoclient);
// message
client.on('messageCreate', (msg) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log(msg.content);
    // console.log(msg.author);
    // console.log(ParseMention(msg.content));
    // prevent the bot from listening to itself
    if (msg.author.id !== constants_1.selfID) {
        const channel = client.channels.cache.get(msg.channelId);
        if (msg.content === "!tenants") {
            (0, commands_1.showTenants)(mongoclient, channel);
        }
        else if (msg.content === "!work") {
            (0, commands_1.work)(mongoclient, channel, msg);
        }
        else if (msg.content.includes("!gamble")) {
            (0, commands_1.gamble)(mongoclient, channel, msg);
        }
        else if (msg.content.includes("!buy")) {
            (0, commands_1.buy)(mongoclient, channel, msg);
        }
        else if (msg.author.id === constants_1.landlordID) {
            let closet = yield mongoclient.db().collection(constants_1.mongoDBcollection);
            // only the landlord has full control of this bot
            if (msg.content.includes("!movein")) {
                (0, commands_1.movein)(closet, channel, msg);
            }
            else if (msg.content.includes("!evict")) {
                (0, commands_1.evict)(closet, channel, msg);
            }
            else if (msg.content.includes("!upgrade")) {
                (0, commands_1.upgrade)(closet, channel, msg);
            }
            else if (msg.content.includes("!downgrade")) {
                (0, commands_1.downgrade)(closet, channel, msg);
            }
            else if (msg.content.includes("!ft")) {
                (0, commands_1.ft)(closet, channel, msg);
            }
            else if (msg.content === "!resethourly") {
                (0, cron_1.reset)(mongoclient);
                channel.send("Labor and gambling should have been reset! Everyone should be able to work and gamble again.");
            }
            else if (msg.content === "!rolesetup") {
                // create all the roles needed
                if (msg.guild) {
                    (0, commands_1.roleSetup)(msg.guild, channel);
                }
                else {
                    console.error("msg.guild is undefined when setting up roles");
                }
            }
            else if (msg.content === "!rolecleanup") {
                if (msg.guild) {
                    (0, commands_1.roleCleanup)(msg.guild);
                }
                else {
                    console.error("msg.guild is undefined when cleaning up roles");
                }
            }
        }
        else if (constants_1.commandList.includes((0, util_1.SplitArgsWithCommand)(msg.content).shift()) && msg.author.id !== constants_1.landlordID) {
            // DEDUCT SQUARE FEET
            const id = msg.author.id;
            let closet = yield mongoclient.db().collection("closet");
            let someCursor = yield closet.findOne({ id: id });
            if (!someCursor) {
                // forcibly move them in
                yield closet.insertOne({
                    name: msg.author.username,
                    id: msg.author.id,
                    ft: constants_1.defaultFt
                });
                channel.send(`${msg.author.username} has been forcibly moved into the closet!`);
                someCursor = yield closet.findOne({ id: id }); // find again
            }
            if (someCursor) {
                // deduct square feet
                const decrease = (0, util_1.RandomFt)(5);
                const newFootage = parseFloat((someCursor.ft - decrease).toFixed(5));
                yield closet.updateOne({ id: id }, {
                    $set: {
                        ft: newFootage
                    }
                });
                channel.send(`**HEY YOU! YOU AREN'T THE LANDLORD!** <@${constants_1.landlordID}>!! This is an **illegal** move by ${someCursor.name}.\n\n**${someCursor.name}** now has **${newFootage} ft^2** now. That's a **${decrease} decrease** in ft^2. Serves you right.`);
            }
        }
    }
}));
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
 * - slots
 * - Rent (?)
 * - Trading square feet for money
 * - Donating money and/or square feet
 * - Titles
 */ 
