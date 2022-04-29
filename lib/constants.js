"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobs = exports.roles = exports.maxSlots = exports.slotSymbols = exports.validGamblingArgs = exports.tails = exports.heads = exports.maxGamble = exports.commandList = exports.landlordName = exports.landlordID = exports.costPerSqFt = exports.debtAdjustment = exports.range = exports.wage = exports.defaultMoney = exports.defaultFt = exports.selfID = exports.mongoDBcollection = void 0;
// SOFTWARE CONSTANTS
exports.mongoDBcollection = "closet"; // the collection on mongodb to store the data
exports.selfID = "967241830074814464"; // id of the bot to prevent any kind of infinite loops
// GAMEPLAY CONSTANTS
exports.defaultFt = 1.0; // starting out square footage
exports.defaultMoney = 0; // starting out money
exports.wage = 14; // minimum wage in California 2022 
exports.range = 1; // when you work, you can get wage +- range. For example, 14 +- 1.
exports.debtAdjustment = 0.5; // if the person owes square footage, take this amount toward paying off the debt
exports.costPerSqFt = 280; // cost per square foot. Refernce: after 2 hours or $28 you can get somewhere between 0.01 and 0.1 square feet
exports.landlordID = "129686495303827456"; // the master of the closet
exports.landlordName = "Dylan";
exports.commandList = ["!movein", "!evict", "!upgrade", "!downgrade", "!ft", "!resethourly"]; // commands that will deduct square feet if used by a tenant
exports.maxGamble = 5; // maximum number of times tenants can gamble per hour
exports.heads = ["h", "heads", "head"];
exports.tails = ["t", "tails", "tail"];
exports.validGamblingArgs = exports.heads.concat(exports.tails); // valid arguments to gamble to check. Should be lowercase.
exports.slotSymbols = [
    "tangerine",
    "lemon",
    "cherries",
    "tangerine",
    "banana",
    "apple",
    "watermelon",
    "pear",
    "strawberry",
    "carrot",
    "pineapple",
    "kiwi",
    "coconut",
    "mango",
    "peach"
];
exports.maxSlots = 10000; // maximum number of times a tenant can roll slots per hour
// lists of things
// roles able to be bought
exports.roles = [
    {
        role: "Switched 180A to PNP",
        price: 3
    },
    {
        role: "Switched 120C to PNP",
        price: 3
    },
    {
        role: "Switched 140A to PNP",
        price: 3
    },
    {
        role: "Switched 118 to PNP",
        price: 3
    },
    {
        role: "Switched 166 to PNP",
        price: 3
    },
    {
        role: "Switched 113C to PNP",
        price: 3
    },
    {
        role: "Minimum Wage Monkey",
        price: 14
    },
    {
        role: "Visited Dylan Via Amtrak",
        price: 56
    },
    {
        role: "Masala Spice Course for 5",
        price: 140
    },
    {
        role: "Visited Dylan Via Plane",
        price: 200
    },
    {
        role: "Dylan's First Laptop Owner",
        price: 700
    },
    {
        role: "I Could Have Bought Closet Space About the Area of Dylan",
        price: 1000
    },
    {
        role: "Dylan's Current Laptop Owner",
        price: 1700
    },
    {
        role: "Wasted 10 Square Feet",
        price: 2000
    },
    {
        role: "Venezulan Billionaire",
        price: 2256
    },
    {
        role: "Owner of About 3 MacBook Pros",
        price: 7500
    },
    {
        role: "1 Year of UCSB Tuition",
        price: 15000
    },
    {
        role: "Prospective Dropout",
        price: 20000
    },
    {
        role: "Tesla Cybertruck Owner",
        price: 40000
    },
    {
        role: "4 Years of UCSB Tuition",
        price: 60000
    },
    {
        role: "Dulan Foundation Esteemed Donor",
        price: 100000
    },
    {
        role: "I Could Have Bought 1,000 Square Feet But Instead I Have a Useless Title Flex",
        price: 200000
    },
    {
        role: "Certified Medical Doctor",
        price: 350000
    },
    {
        role: "Homeowner in Dylan's City",
        price: 500000
    },
    {
        role: "Paid for Chancellor Yang's Salary",
        price: 579750
    },
    {
        role: "Dylan Drew Me A Picture",
        price: 600000
    },
    {
        role: "Owner of Dylan's House (Excluding Closet)",
        price: 700000
    },
    {
        role: "Closet Mascot",
        price: 1000000
    },
    {
        role: "Paid for UCSB's Endowment",
        price: 404000000
    },
    {
        role: "Closet Co-Owner",
        price: 500000000
    },
    {
        role: "Closet Owner",
        price: 1073741824
    },
    {
        role: "Dylan Works for Me",
        price: 2147483647 // max int32
    },
];
// responses to the types of jobs you can do when you do !work
exports.jobs = [
    "streamed on Twitch and got a lucky donation from a viewer",
    "sold some sourdough rolls they baked the night before",
    "mowed some person's lawn in Goleta",
    "folded 60 cardboard boxes",
    "babysat some cats for an hour without losing a single one",
    "babysat a couple of dogs for a bit",
    "ran around town and picked up a bunch of loose change",
    "created a viral YouTube video and made some money off the ad revenue",
    "mopped some floors around ENGR II for fun and got tipped by a grateful janitor",
    "scammed a bunch of ChemE freshmen out of their money",
    "gave advice to a bunch of ChemE freshmen and a grateful parent thanked them for their help",
    "peddled some questionable wares outside of the UCEN",
    "stalked Dylan, found out where he hides all his money, and made some of it \"disappear\" on \"accident\"",
    "published a self-help book and luckily sold a couple of copies on Amazon Kindle before the book was taken down",
    "used their totally legitimate knowledge of Japanese to translate a chapter of someone's favorite manga",
    "busked outside of the music building using some bagpipes and got a generous tip",
    "begged outside of Nikka Ramen for some food and instead got money",
    "ate some Boba Pizza and got paid money to stop advertising it as a valid meal",
    "helped move a piano and got compensated",
    "got hit by a bus and was given some money to not sue",
    "witnessed a sketchy backroom deal in the ChE closet and was given hush money to keep quiet",
    "was asked to write a review of the *Bee* movie. After putting a scathing review on Rotten Tomatoes, a rabid fan tracked them down and threateneed them personally in IV to change their review. After some forceful convincing, the review was changed to praise the movie as one of the best movies of the entire century and deserving of pretty much every single Oscar award: *Barry B Benson* as best actor, the Bee movie for the greatest original score, and its numerous translations winning best forign film. The review then garnered world-wide attention to such a high degree that the Academy had no choice but to reconsider the *Bee* movie for the 2007 Oscars. Unfortunately, the movie did not gain any new awards but the fan, so grateful, went back and slipped in some money into a myserious backpack with a special personalized note expressing their undying love for the movie and how membership to the *Bee* movie fanclub at UCSB has been extended if the money is taken. Welcome to the fanclub",
    "was asked to cut two people's hair and did a good enough job to make a few bucks",
    "rented out their kitchen for someone's \"baking\" party (whatever that is)",
    "scammed some poor freshmen on PDFs of textbooks, charging them when the books can be found online for free. Scumbag",
    "sold some succulents on Free and For Sale",
    "insisted on guiding an old lady across campus to visit her grandchild in Anacapa. Grateful, the old lady gave $4, but mistakingly slipped in $10 on top of that",
    "offered their protection services to a young Freshman to protect them from the bands of raccoons roaming campus",
    "fixed up someone's broken bike",
    "was walking to class when a doordash driver nearly crashed into them, hitting a wall instead. A tragedy, but the doordash order of soup was going to get cold! So, they took over the doordash order instead, driving to Santa Barbara and receiving a generous tip from the millionaire that ordered the soup",
    "bought a large Costco Pizza and sold it for a profit per-slice on campus",
    "stole food from the dining commons and sold it to the desperate people stuck in lab",
    "bought a cheap hoodie, drew \"UCSB College of Engineering\" on it in dry erase marker, marketed it as \"official UCSB merchandise\", then sold it to a clueless prospective student visiting campus",
    "convinced a bunch of people to donate $1",
    "won a bet against Dylan",
    "went metal detecting on the beach, found something interesting, and managed to sell it on Facebook",
    "taught chemistry to a highschooler for some cash, but the student still failed their test unfortunately",
    "tried to teach some math to a kid but the kid cried instead. The sad parent begrudingly forked over money for the tutoring session",
    "tidied up Dylan's closet for some measly money",
    "got refunded some money on their BARC account",
    "decided to try their luck on Twitch. After streaming for about an hour with 0 viewers, MrBeast, for his next video, was going around Twitch asking 10 obscure trivia questions to various streamers for the choice between $1,000,000 or 10 square feet in Dylan's closet. Unfortunately, all 10 questions were horrifically bombed. Taking pity, MrBeast donated some money",
    "got asked to serve as an extra in a student-produced film",
    "found themselves stuck in the middle of movie scene being filmed in Goleta. Too awkward to leave, they blended in as a movie extra and got compensated at the end of the scene",
    "wrote some \"funny\" (questionable) !work responses for Dylan",
    "got paid to do Mastering Physics HW for Dylan",
    "was compensated by UCSB AIChE for agreeing to get pizza from Costco for the rest of the quarter",
    "published a book of self deprececating humor which became a bestseller for the most interesting autobiography in the world for 1 hour",
    "set a new world record for most volume of tears cried after they saw the latest grade on their lab report and was paid by Guiness World Records",
    "got a certificate and small prize for knowing 100 digits of pi",
    "discovered a new type of rock and submitted it to the International Rock Committee. The committee, overjoyed, gave a cash prize. Little did they know, the rock was actually a hardened piece of candy, but it was too late",
    "hid toy eggs for a local church's scavenger hunt for toddlers. Normally, the church gives $40 but unfortunately some of the money got hidden in the eggs instead",
    "smuggled illegal candy through the airport for a dealer, who compensated handsomely",
    "threatened a kid with a lecture on fluid mechanics if they didn't cough up some cash right there and then",
    "got a mysterious email from a Nigerian prince named Abdullahi Ahmed Sumaila. Prince Abdullahi Ahmed Sumaila his lordship was stuck in Kyrgyzstan for a diplomatic meeting and desperately needed to bankwire his pet octopus his allowance to buy a new type of rock from the International Rock Committee. However, Prince Abdullahi Ahmed Sumaila his lordship forgot the password to his bank account. He only had Venmo access. In exchange for a net profit, Prince Abdullahi Ahmed Sumaila his lordship asked for a small Venmo payment of $1,000 to @DulanVuTheLandLord. After the money was Venmoed, Prince Abdullahi Ahmed Sumaila his lordship out of the kindness of his heart paid for the speedy service",
    "volunteered with the Dulan Foundation and entered into a cash prize raffle. With a whopping 0 other participants in the lottery, the cash prize was won",
    "got invited to speak at the Global Conference for Stressed Out Students (GCSOS) and a particularly moved listener gave some money as thanks for the talk",
    "got run over by a group of freshmen on their bikes and was paid to not sue them",
    "participated in a bet that they couldn't ride their bike without hands for more than 1 yard. After riding for 1.01 yards without hands, falling over, and getting concussed, the money was hesitantly forked over. Hey, money's money right? The bank account is now heavier with more cash",
    "made a bunch of balloon animals for the kids near IV elementary, some UCSB seniors, and a few professors",
    "found a semi-rare Pokemon card at Goodwill and auctioned it off online",
    "sold some old textbooks to underclassmen for a few dollars",
    "participated on a fundraising hustle hosted by AIChE and slyly pocketed a few dollars",
    "found an abandoned bike on campus left without wheels, bought some new ones, and sold it for a profit",
    "tricked some poor parents into giving their children advice to getting into UCSB Engineering for a fee",
    "used leftover EBT card money to sell food to hungry engineering students",
    "committed small-scale tax fraud, netting a tiny profit",
    "helped type up these !work scenarios since it's getting kind of tedious",
    "found a lost cat on campus and was given a cash reward",
    "guided a lost puppy to its owner",
    "sold some insect corpses to some zoology students",
    "captured a giant fish in the lagoon, made a pretty good stew from the lagoon water, then sold it outside of the UCEN",
    "created a brand new recipe involving onions, peanut butter, and cabbage and sold it to an aspiring Michelin star chef specializing in unorthodox dishes",
    "gave some really good life advice to a passing toddler who gave some \"funny green paper\" from his mom's purse",
    "pocketed a random rock with the words \"Rockford\" drawn on it. While browsing Facebook, there was a lost and found post on Free and For Sale: \"MISSING ROCK THAT RAN AWAY: ROCKFORD\". The rock looked exactly like the same \"Rockford\" found near the bike path. Messaging the person who made the post, a joyous reunion was witnessed between man and rock",
    "got caught up in the middle of a UCEN heist while walking home from the library. As the theives were running away, some money from the cash register was dropped onto the ground",
    "was asked to help with ENGR 3 homework for some quick money",
    "got a phone call from a phone number \"SCAM LIKELY\". The person who picked up the phone introduced himself as \"Michael Gordon\", brother of \"Michael Jordan.\" Mike has found himself stranded on a deserted island with no internet and cellular service reception and desperately needs some money to call emergency services using the only telephone booth located on the remote, deserted island with no traces of civiliation. Not one to leave someone for dead, $5 was Zelled to @DulanVuTheLandLord. Upon confirming the correct amount of money requested, Mike Gordon successfully called emergency services using the singular, modern, recently built telephone booth that was somehow found on this abandoned jungle. Some extra cash with the note \"thx 4 hep\" was attached to the message",
    "took a quiz in the stead of a student named \"Rick A\" for a bit of moola. The grade: crummy",
    "snapped a photo of two ducks waddling across campus. In the background, a comical scene of two professors being run over by a student riding without hands was captured, which went viral online. A stock image company offered to purchase the picture",
    "was contracted to build a new scientific aparatus for a graduate student. It was found out that buying an actual piece of equipment would've been more cost effective so the the leftover money was distributed to the team"
];
