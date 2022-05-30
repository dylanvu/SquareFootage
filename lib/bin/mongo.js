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
exports.alterData = exports.createTenant = void 0;
const constants_1 = require("../constants");
const util_1 = require("./util");
const createTenant = (collection, id, name) => __awaiter(void 0, void 0, void 0, function* () {
    yield collection.insertOne({
        id: id,
        name: name,
        ft: constants_1.defaultFt,
        money: constants_1.defaultMoney,
        worked: false,
        gambleCount: 0,
        slotCount: 0
    });
});
exports.createTenant = createTenant;
/**
 * directly set a user's status (money, square feet, etc)
 * @param collection mongodb collection to modify user stats
 * @param channel discord channel to send the feedback to
 * @param msg message object to parse the user mention out of to modify the status of
 */
const alterData = (collection, channel, msg, type) => __awaiter(void 0, void 0, void 0, function* () {
    // when defining a new type, be sure to add a new case to the switch/branch
    const args = (0, util_1.SplitArgs)(msg.content);
    if (args.length < 2) {
        channel.send(`You need the @mention and a number to modify that person's ${type}!`);
    }
    const mention = args.shift();
    if (!mention) {
        // do nothing
        channel.send(`You need the @mention to change someone's ${type}.`);
        return;
    }
    const id = (0, util_1.ParseMention)(mention);
    const someCursor = yield collection.findOne({ id: id });
    if (!someCursor) {
        channel.send(`That person you're changing the ${type} of doesn't seem to have moved in yet!`);
    }
    else {
        // parse out the number
        const newStatus = (0, util_1.roundToDecimal)(parseFloat(args[0]), 3); // a bit weird but the message content is a string, so need to convert to number then round
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
        yield collection.updateOne({ id: id }, {
            $set: {
                [characteristic]: newStatus
            }
        });
        if (type === "money") {
            // send a special message for money, since it's a prefix
            channel.send(`**${someCursor.name}** now has **\$${newStatus}** now! They previously had **\$${old}**.`);
        }
        else {
            channel.send(`**${someCursor.name}** now has **${newStatus} ${message}** now! They previously had **${old} ${message}**.`);
        }
    }
});
exports.alterData = alterData;
