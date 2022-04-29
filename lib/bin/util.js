"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roundToDecimal = exports.randomNumber = exports.RandomFt = exports.SplitArgsWithCommand = exports.SplitArgs = exports.ParseMention = void 0;
/**
 *
 * @param message message to parse
 * @returns the numerical ID of a mention
 */
const ParseMention = (message) => {
    const atPos = message.indexOf("@");
    const idLen = 18; // hardcode an 18 length id
    return message.substring(atPos + 1, atPos + idLen + 1);
};
exports.ParseMention = ParseMention;
/**
 *
 * @param message the message to parse
 * @returns an array of arguments passed into the command without the command
 */
const SplitArgs = (message) => {
    const args = message.split(" ");
    args.shift(); // remove out the command
    return args;
};
exports.SplitArgs = SplitArgs;
/**
 *
 * @param message message to parse
 * @returns an array of arguments passed into the command with the command
 */
const SplitArgsWithCommand = (message) => {
    const args = message.split(" ");
    return args;
};
exports.SplitArgsWithCommand = SplitArgsWithCommand;
/**
 *
 * @param weight the number to take 10 to the power of for the upper bound of 0.01 * 10^weight
 * @returns a float rounded to 3 decimal places between 0 and 0.01 * 10^weight
 */
const RandomFt = (weight) => {
    const base = 0.01;
    const factor = Math.pow(10, weight);
    // do the maths
    const random = Math.random() * base * factor;
    return parseFloat(random.toFixed(3));
};
exports.RandomFt = RandomFt;
/**
 * Generates a random integer between low and high (inclusive on both ends)
 * @param low lower bound
 * @param high upper bound
 * @returns random number
 */
const randomNumber = (low, high) => {
    return Math.floor(Math.random() * (high - low + 1) + low);
};
exports.randomNumber = randomNumber;
/**
 * Rounds a number to a certain number of decimal places
 * @param num number to round
 * @param places number of decimal places to round to
 * @returns number rounded to that many decimal places
 */
const roundToDecimal = (num, places) => {
    return parseFloat(num.toFixed(places));
};
exports.roundToDecimal = roundToDecimal;
