import { SplitArgs, ParseMention, RandomFt, roundToDecimal, randomNumber } from "../util";
import { createTenant } from "../mongo";
import { landlordName, roles } from "../../constants";
import Discord from 'discord.js';
import mongo from 'mongodb';

// LANDLORD AND SETUP COMMANDS

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
            await createTenant(collection, id, name);
            // send verification message
            channel.send(`**${name}** has moved into ${landlordName}'s closet!`);
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
            channel.send(`**${name}** has been **EVICTED**. No square feet for them!`);
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
        const newFootage = roundToDecimal(someCursor.ft + increase, 3);
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
        const newFootage = roundToDecimal(someCursor.ft - decrease, 3);
        await collection.updateOne({ id: id }, {
            $set: {
                ft: newFootage
            }
        });
        channel.send(`**${someCursor.name}** has **${newFootage} ft^2** now! That's a ${decrease} **decrease** in ft^2...`);
    }
}

/**
 * Create all the roles in the constants.ts
 * @param guild Discord guild object from message
 */
export const roleSetup = async (guild: Discord.Guild, channel: Discord.TextChannel) => {
    // !rolesetup
    const roleCache = guild.roles.cache;
    let roleAdded: string[] = [];
    for (const role of roles) {
        if (!roleCache.find(x => x.name == role.role)) {
            // role doesn't exist
            await guild.roles.create({
                name: role.role,
                color: [randomNumber(0, 255), randomNumber(0, 255), randomNumber(0, 255)]
            });
            roleAdded.push(role.role)
        } else {
            console.log(`${role.role} already exists`);
        }
    }
    if (roleAdded.length > 0) {
        channel.send(`Roles have been created: ${roleAdded}`);
    } else {
        channel.send(`No new roles were created.`);
    }

}

/**
 * Delete all the roles in the constants.ts
 * @param guild Discord guild object from message
 */
export const roleCleanup = async (guild: Discord.Guild) => {
    const roleCache = guild.roles.cache;
    for (const role of roles) {
        const foundRole = roleCache.find(x => x.name == role.role);
        if (foundRole) {
            // delete
            await guild.roles.delete(foundRole);
            console.log(`Deleted ${role}`);
        } else {
            console.log(`Could not find ${role}`);
        }
    }
}