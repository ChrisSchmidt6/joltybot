# joltybot
A discord bot I created for fun with a points and leveling system, some moderation commands, ranks, ability to gamble points, create and vote on polls, google image search, define words, set a bio, and more.

Make sure to change the following in config.json :
token (your bot token), devServer (the ID of the Discord server you want to use for development/testing) and suggestionChannel (the ID of the Discord channel where any suggestions made by users are sent)

You'll also want to change the following in /db/settings.json :
gisEID (Custom Search Engine ID) and gisAPI (Google Search API Key)
You can find more info on how to set that up here: https://www.npmjs.com/package/google-images

Once you have completed the above steps you want to install the dependencies by navigating to where you have the bot saved and running 'npm install'.
If the dependencies have installed with no errors (you may have to play around with the dependencies as I made this bot in 2018) you can now start the bot by running 'node app.js'.
