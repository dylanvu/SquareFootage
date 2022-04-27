/**
 * 
 * @param message message to parse
 * @returns the numerical ID of a mention
 */
export const ParseMention = (message: string): string => {
    const atPos = message.indexOf("@");
    const idLen = 18; // hardcode an 18 length id
    return message.substring(atPos + 1, atPos + idLen + 1);
}

/**
 * 
 * @param message the message to parse
 * @returns an array of arguments passed into the command without the command
 */
export const SplitArgs = (message: string): string[] => {
    const args = message.split(" ");
    args.shift(); // remove out the command
    return args;
}

/**
 * 
 * @param message message to parse
 * @returns an array of arguments passed into the command with the command
 */
export const SplitArgsWithCommand = (message: string): string[] => {
    const args = message.split(" ");
    return args;
}

/**
 * 
 * @param weight the number to take 10 to the power of for the upper bound of 0.01 * 10^weight
 * @returns a float rounded to 3 decimal places between 0 and 0.01 * 10^weight
 */
export const RandomFt = (weight: number): number => {
    const base = 0.01
    const factor = Math.pow(10, weight);

    // do the maths
    const random = Math.random() * base * factor;
    return parseFloat(random.toFixed(3));
}

/**
 * Generates a random integer between low and high (inclusive on both ends)
 * @param low lower bound
 * @param high upper bound
 * @returns random number
 */
export const randomNumber = (low: number, high: number): number => {
    return Math.floor(Math.random() * (high - low + 1) + low)
}