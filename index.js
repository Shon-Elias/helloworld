// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const color = require('chalk');

const path = require('path');
const restify = require('restify');

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const { BotFrameworkAdapter, MemoryStorage, ConversationState, UserState } = require('botbuilder');

// Import required bot configuration.
const { BotConfiguration } = require('botframework-config');

// This bot's main dialog.
const { HealthBot } = require('./bot');

// Read botFilePath and botFileSecret from .env file
// Note: Ensure you have a .env file and include botFilePath and botFileSecret.
// This give us => console.log(color.blue("ENV"), ENV_FILE)/Users/iShon/Documents/Career/Projects/HealthBot/healthbot/.env
const ENV_FILE = path.join(__dirname, '.env');
const env = require('dotenv').config({path: ENV_FILE});

// bot endpoint name as defined in .bot file
// See https://aka.ms/about-bot-file to learn more about .bot file its use and bot configuration .
const DEV_ENVIRONMENT = 'development';

// bot name as defined in .bot file
// See https://aka.ms/about-bot-file to learn more about .bot file its use and bot configuration.
const BOT_CONFIGURATION = (process.env.NODE_ENV || DEV_ENVIRONMENT);
// console.log(color.blue("BOT_CONFIGURATION"), BOT_CONFIGURATION)

// Create HTTP server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(color.yellow(`\n${server.name} listening to ${server.url}`));
    console.log(color.yellow(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`));
    console.log(color.yellow(`\nTo talk to your bot, open healthbot.bot file in the Emulator`));
});

// .bot file path
const BOT_FILE = path.join(__dirname, (process.env.botFilePath || ''));

// Read bot configuration from .bot file.
let botConfig;
try {
    botConfig = BotConfiguration.loadSync(BOT_FILE, process.env.botFileSecret);
} catch (err) {
    console.error(color.magenta(`\nError reading bot file. Please ensure you have valid botFilePath and botFileSecret set for your environment.`));
    console.error(color.magenta(`\n - The botFileSecret is available under appsettings for your Azure Bot Service bot.`));
    console.error(color.magenta(`\n - If you are running this bot locally, consider adding a .env file with botFilePath and botFileSecret.\n\n`));
    process.exit();
}

// Get bot endpoint configuration by service name
// This gives us the object of services from healthbot.bot file
const endpointConfig = botConfig.findServiceByNameOrId(BOT_CONFIGURATION);
// console.log(color.magenta("endpointConfig", JSON.stringify(endpointConfig)))


// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about .bot file its use and bot configuration .
const adapter = new BotFrameworkAdapter({
    appId: endpointConfig.appId || process.env.microsoftAppID,
    appPassword: endpointConfig.appPassword || process.env.microsoftAppPassword
});

// Define state store for your bot.
// See https://aka.ms/about-bot-state to learn more about bot state.
const memoryStorage = new MemoryStorage(); // {"memory":{},"etag":1}

// CAUTION: You must ensure your product environment has the NODE_ENV set
//          to use the Azure Blob storage or Azure Cosmos DB providers.
// const { BlobStorage } = require('botbuilder-azure');
// Storage configuration name or ID from .bot file
// const STORAGE_CONFIGURATION_ID = '<STORAGE-NAME-OR-ID-FROM-BOT-FILE>';
// // Default container name
// const DEFAULT_BOT_CONTAINER = '<DEFAULT-CONTAINER>';
// // Get service configuration
// const blobStorageConfig = botConfig.findServiceByNameOrId(STORAGE_CONFIGURATION_ID);
// const blobStorage = new BlobStorage({
//     containerName: (blobStorageConfig.container || DEFAULT_BOT_CONTAINER),
//     storageAccountOrConnectionString: blobStorageConfig.connectionString,
// });
// conversationState = new ConversationState(blobStorage);

// Create conversation state with in-memory storage provider.
const conversationState = new ConversationState(memoryStorage); //  {"storage":{"memory":{},"etag":1},"properties":{},"namespace":""}
const userState = new UserState(memoryStorage);

// Create the main dialog.
const myBot = new HealthBot(conversationState, userState);

console.error(color.magenta("myBot", JSON.stringify(myBot)))
// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    console.error(`\n [onTurnError]: ${error}`);
    // Send a message to the user
    context.sendActivity(`Oops. Something went wrong!`);
    // Clear out state
    await conversationState.load(context);
    await conversationState.clear(context);
    // Save state changes.
    await conversationState.saveChanges(context);
};

// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route to main dialog.
        await myBot.onTurn(context);
    });
});

