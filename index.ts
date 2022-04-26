import { jobs } from './constants';
import { ParseMention, SplitArgs, SplitArgsWithCommand, RandomFt } from './util';
import { tenant } from './interface';
import { ResetLabor } from './bin/cron';
import * as dotenv from 'dotenv';
import * as Discord from 'discord.js';
import * as mongo from 'mongodb';
import express from 'express';
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
ResetLabor(mongoclient);

// CONSTANTS
const defaultFt: number = 1.0; // starting out square footage
const defaultMoney: number = 0; // starting out money
const wage: number = 14; // minimum wage in California 2022 
const debtAdjustment: number = 0.5; // if the person owes square footage, take this amount toward paying off the debt
const costPerSqFt: number = 280 // cost per square foot. Refernce: after 2 hours or $28 you can get somewhere between 0.01 and 0.1 square feet

const landlordID = "129686495303827456";

const commandList = ["!movein", "!evict", "!upgrade", "!downgrade", "!ft"]

// message
client.on('messageCreate', async (msg: Discord.Message) => {
    // console.log(msg.content);
    // console.log(msg.author);
    // console.log(ParseMention(msg.content));
    const channel = client.channels.cache.get(msg.channelId) as Discord.TextChannel;
    if (msg.content === "!tenants") {
        let closet = await mongoclient.db().collection("closet");
        // get list of all tenants and square footage, anyone can do this
        // embed message
        let embed: Discord.MessageEmbed = new Discord.MessageEmbed().setColor("#F1C40F")
        let globalClosetSpace = 0;
        const allTenants = await closet.find();
        if ((await closet.estimatedDocumentCount()) === 0) {
            embed.setDescription("No one's gonna live in Dylan's closet... sadge.");
        } else {
            await allTenants.forEach((tenant) => {
                embed.addField(tenant.name, `${tenant.ft} ft^2 \n $${tenant.money} in bank account`);
                if (tenant.ft > 0) {
                    globalClosetSpace += tenant.ft;
                }
            });
            embed.setTitle(`Dylan's Future Closet Tenants - ${globalClosetSpace.toFixed(3)} ft^2 large`);
            channel.send({ embeds: [embed] });
        }
    } else if (msg.content === "!work") {
        // work for minimum wage
        // check if person is in the closet
        // check if the person is in debt
        // give them the appropriate amount
        const id = msg.author.id;
        let closet = await mongoclient.db().collection("closet");
        const userCursor = await closet.findOne({ id: id });
        if (!userCursor) {
            msg.reply("You don't appear to own square feet in Dylan's closet! Ask him to move you in.")
        } else {
            // check if person has worked
            if (userCursor.worked) {
                channel.send(`${userCursor.name}, you've already worked this hour! Wait until the next hour comes.`);
                console.log(`${userCursor.name} has already worked`)
            } else {
                // add money
                const oldMoney = userCursor.money;
                await closet.updateOne({ id: id }, {
                    $set: {
                        money: oldMoney + wage,
                        worked: true
                    }
                });
                channel.send(`**${userCursor.name}** ${jobs[Math.floor(Math.random() * jobs.length)]}. They made $${wage} and now have $${oldMoney + wage} in their bank account!`)
            }
        }
    } else if (msg.author.id === landlordID) {
        let closet = await mongoclient.db().collection("closet");
        // only I have control of this bot
        if (msg.content.includes("!movein")) {
            // arguments: @mention and name
            const args = SplitArgs(msg.content);
            if (args.length < 2) {
                channel.send("You need the @mention and their legal name as arguments.");
            } else {
                // get the id and the name out
                const mention = args.shift();
                if (!mention) {
                    // do nothing
                    channel.send("You need the @mention to move someone in");
                    return
                }
                const id = ParseMention(mention);
                const name = args.join(" "); // make the rest of the message their name

                // add user to closet list with default 1 square foot space
                let someCursor = await closet.findOne({ id: id });
                if (someCursor) {
                    channel.send(`${name} has already moved into the closet!`);
                } else {
                    await closet.insertOne({
                        id: id,
                        name: name,
                        ft: defaultFt,
                        money: defaultMoney,
                        worked: false
                    } as tenant);
                    // send verification message
                    channel.send(`${name} has moved into Dylan's closet!`);
                }
            }
        } else if (msg.content.includes("!evict")) {
            // remove user from the database
            // arguments: @mention
            const args = SplitArgs(msg.content);
            if (args.length < 1) {
                channel.send("You need the @mention to evict someone!");
            } else {
                // get the id and the name out
                const mention = args.shift();
                if (!mention) {
                    // do nothing
                    channel.send("You need the @mention to evict someone.");
                    return
                }
                const id = ParseMention(mention);

                // add user to closet list with default 1 square foot space

                let someCursor = await closet.findOne({ id: id });
                if (!someCursor) {
                    channel.send(`That person does not currently own any square feet in the closet. Perhaps they're an illegal squatter...`);
                } else {
                    const name = someCursor.name;
                    closet.deleteOne({
                        id: id,
                    });
                    // send verification message
                    channel.send(`${name} has been **EVICTED**. No square feet for them!`);
                }
            }
        } else if (msg.content.includes("!upgrade")) {
            // add random square footage weighted?
            // arguments: @mention and number of + for the factor
            const args = SplitArgs(msg.content);
            if (args.length < 2) {
                channel.send("You need the @mention and a plus factor to give someone more square feet!");
            }
            const mention = args.shift();
            if (!mention) {
                // do nothing
                channel.send("You need the @mention to give someone more square feet.");
                return
            }
            const id = ParseMention(mention);
            if (!args[0].includes("+")) {
                channel.send("Missing at least one plus (+)! Can't add square feet!");
            }

            // figure out the weight
            const plusFactor = args[0].match(/\+/g)?.length;
            let increase: number;
            if (plusFactor) {
                increase = RandomFt(plusFactor);
            } else {
                channel.send("There was an issue figuring out the plusFactor. Code the bot better next time...");
                return;
            }
            // store in database
            const someCursor = await closet.findOne({ id: id });
            if (!someCursor) {
                channel.send("That person you're increasing square feet of doesn't seem to have moved in yet!");
            } else {
                // increase feet
                const newFootage = parseFloat((someCursor.ft + increase).toFixed(3));
                await closet.updateOne({ id: id }, {
                    $set: {
                        ft: newFootage
                    }
                });
                channel.send(`**${someCursor.name}** has **${newFootage} ft^2** now! That's a ${increase} **increase** in ft^2! Wow!`);
            }
        } else if (msg.content.includes("!downgrade")) {
            // remove random square footage weighted?
            // add random square footage weighted?
            // arguments: @mention and number of + for the factor
            const args = SplitArgs(msg.content);
            if (args.length < 2) {
                channel.send("You need the @mention and a minus factor to give someone more square feet!");
            }
            const mention = args.shift();
            if (!mention) {
                // do nothing
                channel.send("You need the @mention to remove someone's square feet.");
                return
            }
            const id = ParseMention(mention);
            if (!args[0].includes("-")) {
                channel.send("Missing at least one minus (-)! Can't remove square feet!");
            }

            // figure out the weight
            const minusFactor = args[0].match(/\-/g)?.length;
            let decrease: number;
            if (minusFactor) {
                decrease = RandomFt(minusFactor);
            } else {
                channel.send("There was a problem figuring out the minusFactor. This is like your fourth bot and it still doesn't work right...");
                return;
            }
            // store in database
            const someCursor = await closet.findOne({ id: id });
            if (!someCursor) {
                channel.send("That person you're reducing the square feet of doesn't seem to have moved in yet!");
            } else {
                // increase feet
                const newFootage = parseFloat((someCursor.ft - decrease).toFixed(3));
                await closet.updateOne({ id: id }, {
                    $set: {
                        ft: newFootage
                    }
                });
                channel.send(`**${someCursor.name}** has **${newFootage} ft^2** now! That's a ${decrease} **decrease** in ft^2...`);
            }
        } else if (msg.content.includes("!ft")) {
            const args = SplitArgs(msg.content);
            if (args.length < 2) {
                channel.send("You need the @mention and a new square feet for that person!");
            }
            const mention = args.shift();
            if (!mention) {
                // do nothing
                channel.send("You need the @mention to change someone's square feet.");
                return
            }
            const id = ParseMention(mention);
            const someCursor = await closet.findOne({ id: id });
            if (!someCursor) {
                channel.send("That person you're changing the square feet of doesn't seem to have moved in yet!");
            } else {
                // parse out the number
                const newFootage = parseFloat(parseFloat(args[0]).toFixed(3)); // this is kinda horrific
                if (newFootage === NaN) {
                    channel.send(args[0] + " isn't a number you fool!");
                    return;
                }
                const old = someCursor.ft;
                await closet.updateOne({ id: id }, {
                    $set: {
                        ft: newFootage
                    }
                });
                channel.send(`**${someCursor.name}** now has **${newFootage} ft^2** now! They previously had **${old} ft^2**.`);
            }
        }
    } else if (commandList.includes(SplitArgsWithCommand(msg.content).shift() as string) && msg.author.id !== landlordID) {
        // DEDUCT SQUARE FEET
        const id = msg.author.id;
        let closet = await mongoclient.db().collection("closet");
        let someCursor = await closet.findOne({ id: id });
        if (!someCursor) {
            // forcibly move them in
            await closet.insertOne({
                name: msg.author.username,
                id: msg.author.id,
                ft: defaultFt
            } as tenant);
            channel.send(`${msg.author.username} has been forcibly moved into the closet!`)
            someCursor = await closet.findOne({ id: id }); // find again
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
 * - Gambling (guessing a coin flip result) and putting in money
 *      - Check if user is part of the closet and has not gambled in the past hour
 *      - Every hour reset the gambling cooldown
 *      - Parse command to get the guess and the amount wagered
 *      - RNG 1 or 2 and send the appropriate GIF and then delete it, or have the bot mass edit its own comment until it lands on the actual guess)
 * - Rent (?)
 * - "Working" (hourly claim of money minimum wage) (if you're in debt half of the money goes toward paying back your square feet)
 * - Trading square feet for money
 * - Donating money and/or square feet
 */