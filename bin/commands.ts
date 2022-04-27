import * as mongo from 'mongodb';
import * as Discord from 'discord.js';
import { jobs, defaultFt, defaultMoney, wage, range, maxGamble, landlordName, validGamblingArgs, heads, tails } from '../constants';
import { ParseMention, SplitArgs, RandomFt, randomNumber } from './util';
import { tenant } from '../interface';

/**
 * Send a single embed of all the tenants in the closet
 * @param mongoclient MongoDB client
 * @param channel channel to send message to
 */
export const showTenants = async (mongoclient: mongo.MongoClient, channel: Discord.TextChannel) => {
    let closet = await mongoclient.db().collection("closet");
    // get list of all tenants and square footage, anyone can do this !tenants
    // embed message
    let embed: Discord.MessageEmbed = new Discord.MessageEmbed().setColor("#F1C40F")
    let globalClosetSpace = 0;
    const allTenants = await closet.find();
    if ((await closet.estimatedDocumentCount()) === 0) {
        embed.setDescription(`No one's gonna live in ${landlordName}'s closet... sadge.`);
    } else {
        await allTenants.forEach((tenant) => {
            embed.addField(tenant.name, `${tenant.ft} ft^2 \n$${tenant.money} in bank account\n${maxGamble - tenant.gambleCount} gambles remaining`);
            if (tenant.ft > 0) {
                globalClosetSpace += tenant.ft;
            }
        });
        embed.setTitle(`${landlordName}'s Future Closet Tenants - ${globalClosetSpace.toFixed(3)} ft^2 large`);
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
    // work for minimum wage !work
    // check if person is in the closet
    // check if the person is in debt
    // give them the appropriate amount
    const id = msg.author.id;
    let closet = await mongoclient.db().collection("closet");
    const userCursor = await closet.findOne({ id: id });
    if (!userCursor) {
        msg.reply(`You don't appear to own square feet in ${landlordName}'s closet! Ask him to move you in.`)
    } else {
        // check if person has worked
        if (userCursor.worked) {
            channel.send(`**${userCursor.name}**, you've already worked this hour! Wait until the next hour comes.`);
            console.log(`${userCursor.name} has already worked`)
        } else {
            // add money
            const oldMoney = userCursor.money;
            const newMoney = randomNumber(wage - range, wage + range); // generate a random wage
            await closet.updateOne({ id: id }, {
                $set: {
                    money: oldMoney + newMoney,
                    worked: true
                }
            });
            channel.send(`**${userCursor.name}** ${jobs[Math.floor(Math.random() * jobs.length)]}. They made $${newMoney} and now have $${oldMoney + newMoney} in their bank account!`)
        }
    }
}

export const gamble = async (mongoclient: mongo.MongoClient, channel: Discord.TextChannel, msg: Discord.Message) => {
    // check if user is in the closet
    const id = msg.author.id;
    let closet = await mongoclient.db().collection("closet");
    const userCursor = await closet.findOne({ id: id });
    if (!userCursor) {
        msg.reply(`You don't appear to own square feet in ${landlordName}'s closet! Ask him to move you in before you can gamble.`)
    } else {
        // check if person has gambled the maximum number of times already
        if (userCursor.gambleCount >= maxGamble) {
            channel.send(`**${userCursor.name}**, you've already gambled too much this hour! Let's not develop any gambling addictions, ok? :D`);
            console.log(`${userCursor.name} has already gambled maximum amount of times`)
        } else {
            // arguments should be like: !gamble <result> <amount>
            const args = SplitArgs(msg.content);
            if (args.length <= 1) {
                channel.send(`**${userCursor.name}**, both a result and an amount of money to bet must be specified`);
                return;
            } else {
                // check inputs
                const moneyBet = parseInt(args[1]); // moneybet
                const outcomeBet = args[0].toLowerCase(); // result bet
                if (isNaN(moneyBet)) {
                    // check if bet is a number
                    channel.send(`**${userCursor.name}**, ${moneyBet} is not a number.`);
                } else if (!validGamblingArgs.includes(outcomeBet)) {
                    // check if proposed outcome is valid
                    channel.send(`**${userCursor.name}**, ${outcomeBet} is not a valid option. Choose one of the following: ${validGamblingArgs}`);
                } else {
                    // create random number
                    const outcome = randomNumber(0, 1); // let 0 be heads, 1 be tails
                    let win = false; // flag if won
                    let adjustment = -1 * moneyBet; // how much to add or subtract by
                    if (outcome === 0) {
                        // heads
                        channel.send("**HEADS**");
                        if (heads.includes(outcomeBet)) {
                            win = true;
                        }
                    }
                    if (outcome === 1) {
                        channel.send("**TAILS**");
                        if (tails.includes(outcomeBet)) {
                            win = true;
                        }
                    }

                    if (win) {
                        adjustment = -1 * adjustment; // make this a positive number to add cash
                    }

                    // increment gambling count
                    const currGamble = userCursor.gambleCount;
                    const oldMoney = userCursor.money;
                    await closet.updateOne({ id: id }, {
                        $set: {
                            gambleCount: currGamble + 1,
                            money: oldMoney + adjustment
                        }
                    });
                    // send the messages
                    if (win) {
                        channel.send(`**${userCursor.name}**, you guessed correctly! You made **$${adjustment}** and now have **$${oldMoney + adjustment}** in your bank account!\n\nYou can gamble ${maxGamble - (currGamble + 1)} more times this hour.`);
                    } else {
                        channel.send(`**${userCursor.name}**, you guessed incorrectly. You lost **$${-1 * adjustment}** and now have **$${oldMoney + adjustment}** in your bank account... sadge\n\nYou can gamble ${maxGamble - (currGamble + 1)} more times this hour.`);
                    }
                }
            }
        }
    }
    // TODO: create like an array of length 10 and then spam edit with alternating heads/tails to simulate flipping, then end on **result** in bold. Maybe about 5 edits per second -> 3 seconds in length?
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
            channel.send(`${name} has moved into ${landlordName}'s closet!`);
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