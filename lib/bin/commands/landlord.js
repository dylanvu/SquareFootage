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
exports.roleCleanup = exports.roleSetup = exports.downgrade = exports.upgrade = exports.evict = exports.movein = void 0;
const util_1 = require("../util");
const mongo_1 = require("../mongo");
const constants_1 = require("../../constants");
// LANDLORD AND SETUP COMMANDS
/**
 * add a new user to the database
 * @param collection mongodb collection to add user to
 * @param channel discord channel to send the feedback to
 * @param msg message object to parse the user mention out of to move in
 */
const movein = (collection, channel, msg) => __awaiter(void 0, void 0, void 0, function* () {
    // arguments: @mention and name
    const args = (0, util_1.SplitArgs)(msg.content);
    if (args.length < 2) {
        channel.send("You need the @mention and their legal name as arguments.");
    }
    else {
        // get the id and the name out
        const mention = args.shift();
        if (!mention) {
            // do nothing
            channel.send("You need the @mention to move someone in");
            return;
        }
        const id = (0, util_1.ParseMention)(mention);
        const name = args.join(" "); // make the rest of the message their name
        // add user to closet list with default 1 square foot space
        let someCursor = yield collection.findOne({ id: id });
        if (someCursor) {
            channel.send(`${name} has already moved into the closet!`);
        }
        else {
            yield (0, mongo_1.createTenant)(collection, id, name);
            // send verification message
            channel.send(`**${name}** has moved into ${constants_1.landlordName}'s closet!`);
        }
    }
});
exports.movein = movein;
/**
 * remove a user from the database
 * @param collection mongodb collection to remove user from
 * @param channel discord channel to send the feedback to
 * @param msg message object to parse the user mention out of to evict from db
 */
const evict = (collection, channel, msg) => __awaiter(void 0, void 0, void 0, function* () {
    // remove user from the database
    // arguments: @mention
    const args = (0, util_1.SplitArgs)(msg.content);
    if (args.length < 1) {
        channel.send("You need the @mention to evict someone!");
    }
    else {
        // get the id and the name out
        const mention = args.shift();
        if (!mention) {
            // do nothing
            channel.send("You need the @mention to evict someone.");
            return;
        }
        const id = (0, util_1.ParseMention)(mention);
        // add user to closet list with default 1 square foot space
        let someCursor = yield collection.findOne({ id: id });
        if (!someCursor) {
            channel.send(`That person does not currently own any square feet in the closet. Perhaps they're an illegal squatter...`);
        }
        else {
            const name = someCursor.name;
            collection.deleteOne({
                id: id,
            });
            // send verification message
            channel.send(`**${name}** has been **EVICTED**. No square feet for them!`);
        }
    }
});
exports.evict = evict;
/**
 * increase a user's square feet based on the number of +
 * @param collection mongodb collection to modify user stats
 * @param channel discord channel to send the feedback to
 * @param msg message object to parse the user mention out of to increase square footage of
 */
const upgrade = (collection, channel, msg) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // add random square footage weighted?
    // arguments: @mention and number of + for the factor
    const args = (0, util_1.SplitArgs)(msg.content);
    if (args.length < 2) {
        channel.send("You need the @mention and a plus factor to give someone more square feet!");
    }
    const mention = args.shift();
    if (!mention) {
        // do nothing
        channel.send("You need the @mention to give someone more square feet.");
        return;
    }
    const id = (0, util_1.ParseMention)(mention);
    if (!args[0].includes("+")) {
        channel.send("Missing at least one plus (+)! Can't add square feet!");
    }
    // figure out the weight
    const plusFactor = (_a = args[0].match(/\+/g)) === null || _a === void 0 ? void 0 : _a.length;
    let increase;
    if (plusFactor) {
        increase = (0, util_1.RandomFt)(plusFactor);
    }
    else {
        channel.send("There was an issue figuring out the plusFactor. Code the bot better next time...");
        return;
    }
    // store in database
    const someCursor = yield collection.findOne({ id: id });
    if (!someCursor) {
        channel.send("That person you're increasing square feet of doesn't seem to have moved in yet!");
    }
    else {
        // increase feet
        const newFootage = (0, util_1.roundToDecimal)(someCursor.ft + increase, 3);
        yield collection.updateOne({ id: id }, {
            $set: {
                ft: newFootage
            }
        });
        channel.send(`**${someCursor.name}** has **${newFootage} ft^2** now! That's a ${increase} **increase** in ft^2! Wow!`);
    }
});
exports.upgrade = upgrade;
/**
 * decrease a user's square feet based on the number of -
 * @param collection mongodb collection to modify user stats
 * @param channel discord channel to send the feedback to
 * @param msg message object to parse the user mention out of to decrease square footage of
 */
const downgrade = (collection, channel, msg) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    // remove random square footage weighted?
    // arguments: @mention and number of - for the factor
    const args = (0, util_1.SplitArgs)(msg.content);
    if (args.length < 2) {
        channel.send("You need the @mention and a minus factor to give someone more square feet!");
    }
    const mention = args.shift();
    if (!mention) {
        // do nothing
        channel.send("You need the @mention to remove someone's square feet.");
        return;
    }
    const id = (0, util_1.ParseMention)(mention);
    if (!args[0].includes("-")) {
        channel.send("Missing at least one minus (-)! Can't remove square feet!");
    }
    // figure out the weight
    const minusFactor = (_b = args[0].match(/\-/g)) === null || _b === void 0 ? void 0 : _b.length;
    let decrease;
    if (minusFactor) {
        decrease = (0, util_1.RandomFt)(minusFactor);
    }
    else {
        channel.send("There was a problem figuring out the minusFactor. This is like your fourth bot and it still doesn't work right...");
        return;
    }
    // store in database
    const someCursor = yield collection.findOne({ id: id });
    if (!someCursor) {
        channel.send("That person you're reducing the square feet of doesn't seem to have moved in yet!");
    }
    else {
        // increase feet
        const newFootage = (0, util_1.roundToDecimal)(someCursor.ft - decrease, 3);
        yield collection.updateOne({ id: id }, {
            $set: {
                ft: newFootage
            }
        });
        channel.send(`**${someCursor.name}** has **${newFootage} ft^2** now! That's a ${decrease} **decrease** in ft^2...`);
    }
});
exports.downgrade = downgrade;
/**
 * Create all the roles in the constants.ts
 * @param guild Discord guild object from message
 */
const roleSetup = (guild, channel) => __awaiter(void 0, void 0, void 0, function* () {
    // !rolesetup
    const roleCache = guild.roles.cache;
    let roleAdded = [];
    for (const role of constants_1.roles) {
        if (!roleCache.find(x => x.name == role.role)) {
            // role doesn't exist
            yield guild.roles.create({
                name: role.role,
                color: [(0, util_1.randomNumber)(0, 255), (0, util_1.randomNumber)(0, 255), (0, util_1.randomNumber)(0, 255)]
            });
            roleAdded.push(role.role);
        }
        else {
            console.log(`${role.role} already exists`);
        }
    }
    if (roleAdded.length > 0) {
        channel.send(`Roles have been created: ${roleAdded}`);
    }
    else {
        channel.send(`No new roles were created.`);
    }
});
exports.roleSetup = roleSetup;
/**
 * Delete all the roles in the constants.ts
 * @param guild Discord guild object from message
 */
const roleCleanup = (guild) => __awaiter(void 0, void 0, void 0, function* () {
    const roleCache = guild.roles.cache;
    for (const role of constants_1.roles) {
        const foundRole = roleCache.find(x => x.name == role.role);
        if (foundRole) {
            // delete
            yield guild.roles.delete(foundRole);
            console.log(`Deleted ${role}`);
        }
        else {
            console.log(`Could not find ${role}`);
        }
    }
});
exports.roleCleanup = roleCleanup;
