const tmi = require('tmi.js');
const fs = require('fs');
const token = require('./token.js')
// Define configuration options
const opts = {
  identity: {
    username: 'treyfrogbot',
    password: 'oauth:' + token.token
  },
  channels: [
    'treyfrog128'
  ]
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler(target, context, msg, self) {
  // if (self) { return; } // Ignore messages from the bot
  // console.log('username: ', context.username)
  // console.log('first message: ', context['first-msg'])
  // console.log('context type: ', typeof context.first-msg.value)
  // Remove whitespace from chat message
  const commandName = msg.trim();
  addChatter(context.username, dateCreator(new Date()));
  // If the command is known, let's execute it
  if (commandName === '!dice') {
    const num = rollDice();
    client.say(target, `You rolled a ${num}`);
    console.log(`* Executed ${commandName} command`);
  } else {
    console.log(`* Unknown command ${commandName}`);
  }
}

// Function called when the "dice" command is issued
function rollDice() {
  const sides = 6;
  return Math.floor(Math.random() * sides) + 1;
}

function dateCreator(dateObj) {
  const dateArray = dateObj.toLocaleString('en-gb', { timeZone: 'Pacific/Honolulu' }).split(',')[0].split('/');
  for (let i = 0; i < 3; i += 1) {
    dateArray[i] = dateArray[i].padStart(2, '0');
  }
  [dateArray[0], dateArray[2]] = [dateArray[2], dateArray[0]];
  return dateArray.join('-');
}

function addChatter(username, todaysDate) {
  const chatterFile = './user-chatters/' + todaysDate + '.json';
  fs.readFile(chatterFile, (err, data) => {
    if (err) {
      const newUserObj = {};
      newUserObj[username] = 1;
      fs.appendFile(chatterFile, JSON.stringify(newUserObj), (err) => console.log(err));
    }
    else {
      let chatters = JSON.parse(data);
      if (chatters[username]) chatters[username] += 1;
      else chatters[username] = 1;
      fs.writeFile(chatterFile, JSON.stringify(chatters), (err) => {
        if (err) throw err;
      })
    }
  })
};
const topChatters = [];
function topChatterOrg(todaysDate) {
  const chatterNames = [];
  const chatterFile = './user-chatters/' + todaysDate + '.json';
  fs.readFile(chatterFile, (err, data) => {

    let chatters = JSON.parse(data);
    for (let chatter in chatters) {
      chatterNames.push([chatter, chatters[chatter]])
    }
    chatterNames.sort(function (a, b) { return b[1] - a[1] });
    for (let i = 0; i < Math.min(chatterNames.length, 10); i += 1) {
      console.log('top')
      topChatters.push(chatterNames[i][0])
    }
  })
}

topChatterOrg(dateCreator(new Date()))
console.log(topChatters)
// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}