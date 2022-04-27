"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomFt = exports.SplitArgsWithCommand = exports.SplitArgs = exports.ParseMention = void 0;
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
