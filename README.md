# SquareFootage
A Discord Bot for Keeping Track of the Closet Space I Owe People (Inside Joke)

I speed coded this in like 2 hours so it's not too organized or well thought out.

## Commands
- !movein [discord user mention] [name]: adds the user to the closet list
- !evict [discord user mention]: removes the user from the closet list
- !tenants : lists out all the people who will live in the closet and their space. Calculates the total amount of closet space needed.
- !upgrade [discord user mention]: increases the square footage of the user by a random amount
- !downgrade [discord user mention]: decreaess the square footage of the user by a random amount
- !ft [discord user mention] [square feet number]: assigns the square feet to the user

* https://dev.to/arnavkr/updating-node-js-to-16-in-replit-1ep0 Update Replit NodeJS version

```npm init -y && npm i --save-dev node@16 && npm config set prefix=$(pwd)/node_modules/node && export PATH=$(pwd)/node_modules/node/bin:$PATH```

## Future Features
- daily money rolling
- daily rent (if not enough money, a random square feet is deducted instead)
- trading space
- restraining order (for the landlord)
- coup (all tenants must vote to replace the landlord)