import * as mongo from 'mongodb';
import { tenant } from '../interface';
import { defaultFt, defaultMoney } from '../constants';
import { SplitArgs, ParseMention, roundToDecimal } from './util';
import Discord from 'discord.js';
import e from 'express';

export const createTenant = async (collection: mongo.Collection, id: string, name: string) => {
    await collection.insertOne({
        id: id,
        name: name,
        ft: defaultFt,
        money: defaultMoney,
        worked: false,
        gambleCount: 0,
        slotCount: 0
    } as tenant);
}

/**
 * directly set a user's status (money, square feet, etc)
 * @param collection mongodb collection to modify user stats
 * @param channel discord channel to send the feedback to 
 * @param msg message object to parse the user mention out of to modify the status of
 */
export const alterData = async (collection: mongo.Collection, channel: Discord.TextChannel, msg: Discord.Message, type: "square feet" | "money") => {
    // when defining a new type, be sure to add a new case to the switch/branch
    const args = SplitArgs(msg.content);
    if (args.length < 2) {
        channel.send(`You need the @mention and a number to modify that person's ${type}!`);
    }
    const mention = args.shift();
    if (!mention) {
        // do nothing
        channel.send(`You need the @mention to change someone's ${type}.`);
        return
    }
    const id = ParseMention(mention);
    const someCursor = await collection.findOne({ id: id });
    if (!someCursor) {
        channel.send(`That person you're changing the ${type} of doesn't seem to have moved in yet!`);
    } else {
        // parse out the number
        const newStatus = roundToDecimal(parseFloat(args[0]), 3); // a bit weird but the message content is a string, so need to convert to number then round
        if (newStatus === NaN) {
            channel.send(args[0] + " isn't a number you fool!");
            return;
        }
        let characteristic = "";
        let message = "";
        switch (type) {
            case "money":
                characteristic = "money";
                message = "dollars";
                break;
            case "square feet":
                characteristic = "ft";
                message = "ft^2";
                break;
            default:
                channel.send(`An error has occurred in the bot. There is no switch case coded in for ${type}.`);
                return;
        }

        const old = someCursor[characteristic];
        if (!old) {
            channel.send(`An error has occurred in the bot. Could not get data -${characteristic}- for the person in the database.`);
            return;
        }
        await collection.updateOne({ id: id }, {
            $set: {
                [characteristic]: newStatus
            }
        });
        if (type === "money") {
            // send a special message for money, since it's a prefix
            channel.send(`**${someCursor.name}** now has **\$${newStatus}** now! They previously had **\$${old}**.`);
        } else {
            channel.send(`**${someCursor.name}** now has **${newStatus} ${message}** now! They previously had **${old} ${message}**.`);
        }
    }
}