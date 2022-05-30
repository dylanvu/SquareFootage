"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.slots = exports.gamble = void 0;
const constants_1 = require("../../constants");
const util_1 = require("../util");
/**
 * Flip a coin to get money
 * @param mongoclient mongodb client
 * @param channel channel to send feedback to
 * @param msg message object to parse arguments and user from
 * @returns
 */
const gamble = (mongoclient, channel, msg) => __awaiter(void 0, void 0, void 0, function* () {
    // check if user is in the closet
    const id = msg.author.id;
    let closet = yield mongoclient.db().collection(constants_1.mongoDBcollection);
    const userCursor = yield closet.findOne({ id: id });
    if (!userCursor) {
        msg.reply(`You don't appear to own square feet in ${constants_1.landlordName}'s closet! Ask him to move you in before you can gamble.`);
    }
    else {
        // check if person has gambled the maximum number of times already
        if (userCursor.gambleCount >= constants_1.maxGamble) {
            channel.send(`**${userCursor.name}**, you've already gambled too much this hour! Let's not develop any gambling addictions, ok? :D`);
            console.log(`${userCursor.name} has already gambled maximum amount of times`);
        }
        else {
            // arguments should be like: !gamble <result> <amount>
            const args = (0, util_1.SplitArgs)(msg.content);
            if (args.length <= 1) {
                channel.send(`**${userCursor.name}**, both a result and an amount of money to bet must be specified`);
                return;
            }
            else {
                // check if the user owes money
                if (userCursor.money < 0) {
                    channel.send(`**${userCursor.name}**, you can't gamble while owing **$${(-1 * userCursor.money).toLocaleString()}**! Go to work you bum. (Or ask the landlord to reset your money if the debt is impossible to pay off)`);
                    return;
                }
                // check inputs
                const moneyBet = parseInt(args[1]); // moneybet
                const outcomeBet = args[0].toLowerCase(); // result bet
                if (isNaN(moneyBet) || moneyBet <= 0) {
                    // check if bet is a number
                    channel.send(`**${userCursor.name}**, ${args[1]} is not a valid number.`);
                }
                else if (!constants_1.validGamblingArgs.includes(outcomeBet)) {
                    // check if proposed outcome is valid
                    channel.send(`**${userCursor.name}**, ${outcomeBet} is not a valid option. Choose one of the following: ${constants_1.validGamblingArgs}`);
                }
                else {
                    // create random number
                    const outcome = (0, util_1.randomNumber)(0, 1); // let 0 be heads, 1 be tails
                    let win = false; // flag if won
                    let adjustment = -1 * moneyBet; // how much to add or subtract by
                    if (outcome === 0) {
                        // heads
                        channel.send("**HEADS**");
                        if (constants_1.heads.includes(outcomeBet)) {
                            win = true;
                        }
                    }
                    if (outcome === 1) {
                        channel.send("**TAILS**");
                        if (constants_1.tails.includes(outcomeBet)) {
                            win = true;
                        }
                    }
                    if (win) {
                        adjustment = -1 * adjustment; // make this a positive number to add cash
                    }
                    // increment gambling count
                    const currGamble = userCursor.gambleCount;
                    const oldMoney = userCursor.money;
                    yield closet.updateOne({ id: id }, {
                        $set: {
                            gambleCount: currGamble + 1,
                            money: oldMoney + adjustment
                        }
                    });
                    // send the messages
                    if (win) {
                        channel.send(`**${userCursor.name}**, you guessed correctly! You made **$${adjustment.toLocaleString()}** and now have **$${(oldMoney + adjustment).toLocaleString()}** in your bank account!\n\nYou can gamble ${constants_1.maxGamble - (currGamble + 1)} more times this hour.`);
                    }
                    else {
                        channel.send(`**${userCursor.name}**, you guessed incorrectly. You lost **$${(-1 * adjustment).toLocaleString()}** and now have **$${(oldMoney + adjustment).toLocaleString()}** in your bank account... sadge\n\nYou can gamble ${constants_1.maxGamble - (currGamble + 1)} more times this hour.`);
                    }
                }
            }
        }
    }
    // TODO: create like an array of length 10 and then spam edit with alternating heads/tails to simulate flipping, then end on **result** in bold. Maybe about 5 edits per second -> 3 seconds in length?
});
exports.gamble = gamble;
/**
 * Roll slots to get money
 * @param mongoclient mongodb client
 * @param channel channel to send the message to
 * @param msg message to parse the info out of
 * @returns
 */
const slots = (mongoclient, channel, msg) => __awaiter(void 0, void 0, void 0, function* () {
    // !slots
    // check if user is in the closet
    const id = msg.author.id;
    let closet = yield mongoclient.db().collection(constants_1.mongoDBcollection);
    const userCursor = yield closet.findOne({ id: id });
    if (!userCursor) {
        msg.reply(`You don't appear to own square feet in ${constants_1.landlordName}'s closet! Ask him to move you in before you can gamble.`);
    }
    else {
        // check if person has gambled the maximum number of times already
        if (userCursor.slotCount >= constants_1.maxSlots) {
            channel.send(`**${userCursor.name}**, you've already gambled too much this hour! Let's not develop any gambling addictions, ok? :D`);
            console.log(`${userCursor.name} has already rolled slots the maximum amount of times`);
        }
        else {
            // arguments should be like: !slots <amount>
            const args = (0, util_1.SplitArgs)(msg.content);
            // check if the user owes money
            if (userCursor.money < 0) {
                channel.send(`**${userCursor.name}**, you can't roll slots while owing **$${(-1 * userCursor.money).toLocaleString()}**! Go to work you bum. (Or ask the landlord to reset your money if the debt is impossible to pay off)`);
                return;
            }
            // check inputs
            // default to 1 if no money specified
            let moneyBet;
            if (args.length < 1) {
                moneyBet = 1;
            }
            else {
                moneyBet = parseInt(args[0]);
            }
            if (isNaN(moneyBet) || moneyBet <= 0) {
                // check if bet is a number
                channel.send(`**${userCursor.name}**, ${moneyBet} is not a valid number.`);
            }
            else {
                // create the finished outcome
                const outcome = [];
                outcome.push((0, util_1.randomNumber)(0, constants_1.slotSymbols.length - 1));
                outcome.push((0, util_1.randomNumber)(0, constants_1.slotSymbols.length - 1));
                outcome.push((0, util_1.randomNumber)(0, constants_1.slotSymbols.length - 1));
                console.log(`Slot roll by ${userCursor.name}`, outcome);
                let win = false; // flag if won
                let jackpot = false;
                let adjustment = -1 * moneyBet; // how much to add or subtract by
                // check if we have a match
                if (outcome.filter((num) => num === outcome[0]).length === outcome.length) {
                    // all numbers are the same
                    // check if jackpot is won, which is all 0's set by default
                    win = true;
                    if (outcome[0] === 0) {
                        jackpot = true;
                    }
                }
                // send results to channel
                let message = "";
                for (const symbol of outcome) {
                    message = message + `:${constants_1.slotSymbols[symbol]}: `;
                }
                channel.send(message);
                const currSlot = userCursor.slotCount;
                const oldMoney = userCursor.money;
                // proceess the score
                // expected value is like +$126
                if (win && jackpot) {
                    // jackpot payout
                    adjustment = -1 * adjustment * 400000;
                    // this is about a 0.0125% chance of happening
                    channel.send(`**${userCursor.name}**, JACKPOT!! :${constants_1.slotSymbols[0]}: :${constants_1.slotSymbols[0]}: :${constants_1.slotSymbols[0]}: \nYou made **$${adjustment.toLocaleString()}** and now have **$${(oldMoney + adjustment).toLocaleString()}** in your bank account!\n\nYou can roll slots **${constants_1.maxSlots - (currSlot + 1)}** more times this hour.`);
                }
                else if (win) {
                    // normal payout
                    adjustment = -1 * adjustment * 2000;
                    channel.send(`**${userCursor.name}**, you WIN! You made **$${adjustment.toLocaleString()}** and now have **$${(oldMoney + adjustment).toLocaleString()}** in your bank account!\n\nYou can roll slots **${constants_1.maxSlots - (currSlot + 1)}** more times this hour.`);
                }
                else {
                    channel.send(`**${userCursor.name}**, you didn't win. You lost **$${(-1 * adjustment).toLocaleString()}** and now have **$${(oldMoney + adjustment).toLocaleString()}** in your bank account... rip\n\nYou can roll slots **${constants_1.maxSlots - (currSlot + 1)}** more times this hour.`);
                }
                // adjustment is negative
                // increment gambling count and adjust money
                yield closet.updateOne({ id: id }, {
                    $set: {
                        slotCount: currSlot + 1,
                        money: oldMoney + adjustment
                    }
                });
            }
        }
    }
});
exports.slots = slots;
