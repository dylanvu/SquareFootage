import * as mongo from 'mongodb';
import * as Discord from 'discord.js';
import { jobs, defaultFt, defaultMoney, wage } from '../constants';
import { ParseMention, SplitArgs, SplitArgsWithCommand, RandomFt } from './util';
import { tenant } from '../interface';

/**
 * Send a single embed of all the tenants in the closet
 * @param mongoclient MongoDB client
 * @param channel channel to send message to
 */
export const showTenants = async (mongoclient: mongo.MongoClient, channel: Discord.TextChannel) => {
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
}

/**
 * Increment the bank account of the command user by the default wage
 * @param mongoclient mongoDB client
 * @param channel channel to send response to
 * @param msg message object to get user id from
 */
export const work = async (mongoclient: mongo.MongoClient, channel: Discord.TextChannel, msg: Discord.Message) => {
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
}

// LANDLORD COMMANDS

/**
 * add a new user to the database
 * @param collection mongodb collection to add user to
 * @param channel discord channel to send the feedback to 
 * @param msg message object to parse the user mention out of to move in
 */
export const movein = async (collection: mongo.Collection, channel: Discord.TextChannel, msg: Discord.Message) => {
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
        let someCursor = await collection.findOne({ id: id });
        if (someCursor) {
            channel.send(`${name} has already moved into the closet!`);
        } else {
            await collection.insertOne({
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
}

/**
 * remove a user from the database
 * @param collection mongodb collection to remove user from
 * @param channel discord channel to send the feedback to 
 * @param msg message object to parse the user mention out of to evict from db
 */
export const evict = async (collection: mongo.Collection, channel: Discord.TextChannel, msg: Discord.Message) => {
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

        let someCursor = await collection.findOne({ id: id });
        if (!someCursor) {
            channel.send(`That person does not currently own any square feet in the closet. Perhaps they're an illegal squatter...`);
        } else {
            const name = someCursor.name;
            collection.deleteOne({
                id: id,
            });
            // send verification message
            channel.send(`${name} has been **EVICTED**. No square feet for them!`);
        }
    }
}

/**
 * increase a user's square feet based on the number of +
 * @param collection mongodb collection to modify user stats
 * @param channel discord channel to send the feedback to 
 * @param msg message object to parse the user mention out of to increase square footage of
 */
export const upgrade = async (collection: mongo.Collection, channel: Discord.TextChannel, msg: Discord.Message) => {
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
    const someCursor = await collection.findOne({ id: id });
    if (!someCursor) {
        channel.send("That person you're increasing square feet of doesn't seem to have moved in yet!");
    } else {
        // increase feet
        const newFootage = parseFloat((someCursor.ft + increase).toFixed(3));
        await collection.updateOne({ id: id }, {
            $set: {
                ft: newFootage
            }
        });
        channel.send(`**${someCursor.name}** has **${newFootage} ft^2** now! That's a ${increase} **increase** in ft^2! Wow!`);
    }
}

/**
 * decrease a user's square feet based on the number of -
 * @param collection mongodb collection to modify user stats
 * @param channel discord channel to send the feedback to 
 * @param msg message object to parse the user mention out of to decrease square footage of
 */
export const downgrade = async (collection: mongo.Collection, channel: Discord.TextChannel, msg: Discord.Message) => {
    // remove random square footage weighted?
    // arguments: @mention and number of - for the factor
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
    const someCursor = await collection.findOne({ id: id });
    if (!someCursor) {
        channel.send("That person you're reducing the square feet of doesn't seem to have moved in yet!");
    } else {
        // increase feet
        const newFootage = parseFloat((someCursor.ft - decrease).toFixed(3));
        await collection.updateOne({ id: id }, {
            $set: {
                ft: newFootage
            }
        });
        channel.send(`**${someCursor.name}** has **${newFootage} ft^2** now! That's a ${decrease} **decrease** in ft^2...`);
    }
}

/**
 * directly set a user's square footage
 * @param collection mongodb collection to modify user stats
 * @param channel discord channel to send the feedback to 
 * @param msg message object to parse the user mention out of to modify the square footage of
 */
export const ft = async (collection: mongo.Collection, channel: Discord.TextChannel, msg: Discord.Message) => {
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
    const someCursor = await collection.findOne({ id: id });
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
        await collection.updateOne({ id: id }, {
            $set: {
                ft: newFootage
            }
        });
        channel.send(`**${someCursor.name}** now has **${newFootage} ft^2** now! They previously had **${old} ft^2**.`);
    }
}