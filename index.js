/*
 * IMPORTANT INFO
 ! DEPRECATED METHOD, DONT USE
 ? SHOULD THIS INFO BE EXPOSED
 TODO: THINGS TO DO
*/

const Discord = require('discord.js');
const client = new Discord.Client();
const fetch =  require('node-fetch'); 


// * GLOBAL VARIABLES
const prefix = '#';
let receptionChannel;
let rolesChannel;
let announcementChannel = '';
let lobbyChannel = '';
let logsChannel = '';
let interactiveChannel = '';


// * FUNCTIONS

async function response (api = '', secondAPI = '', channelID, purpose = '') { // A GENERAL API FETCHING FUNCTION
        
    let today = new Date();
    let date = today.getDate() + '-' +(today.getMonth()+1) + '-' + today.getFullYear();
    
    fetch(`${api}`)
        .then(response => {
            return response.json();
        })

        .then((data) => {
            if(purpose=='getWeather'){
            let forecast = `[${":white_sun_small_cloud:"} Forecast] ${weatherIcon(data.hourly[0].weather[0].icon)} ${data.hourly[0].weather[0].description}, ${weatherIcon(data.hourly[4].weather[0].icon)} ${data.hourly[4].weather[0].description}, ${weatherIcon(data.hourly[8].weather[0].icon)} ${data.hourly[8].weather[0].description}`;
            let dailyMax = `[${":small_red_triangle:"} Max] ${temperatureIcon(data.daily[0].temp.max)} ${data.daily[0].temp.max}\xB0 Celsius`;
            let dailyMin = `[${":small_red_triangle_down:"} Min] ${temperatureIcon(data.daily[0].temp.min)} ${data.daily[0].temp.min}\xB0 Celsius `;
            
            async function response2 (api = '', channelID) {
                
                fetch(`${api}`)
                .then(response => {
                    return response.json();
                })
                .then((data) => {
                    const weatherEmbed = new Discord.MessageEmbed() // BELOW IS THE EMBED OPTIONS FOR THE MSG
                    .setColor('#e4cd3b')
                    .addField(`${":map:"} Location: Ottawa, ON`, `
                    ${forecast}
                    [${":thermometer:"} Current] ${temperatureIcon(data.main.temp)} ${data.main.temp}\xB0 Celsius 
                    ${dailyMax}
                    ${dailyMin} 
                    `)
                    .setFooter(`Date: ${date}`)
                channelID.send(weatherEmbed); // SENDS THE EMBED
                })
            }
            response2(secondAPI, channelID);
        }

        if(purpose=='etc'){}
    })
}

function toVoteEmbed (message, title, options, timeout, emojiList, forceEndPollEmoji) {
    const { MessageEmbed } = require("discord.js");

    const defEmojiList = [
        "\u0031\u20E3",
        "\u0032\u20E3",
        "\u0033\u20E3",
        "\u0034\u20E3",
        "\u0035\u20E3",
        "\u0036\u20E3",
        "\u0037\u20E3",
        "\u0038\u20E3",
        "\u0039\u20E3",
        "\uD83D\uDD1F",
    ];

    const voteEmbed = async (
        message,
        title,
        options,
        timeout = 30,
        emojiList = defEmojiList.slice(),
        forceEndPollEmoji = "\u2705"
    ) => {
        if (!message && !message.channel)
            return message.reply("Channel access denied.");
        if (!title) return message.reply("Please specify the title.");
        if (!options) {
            options = ["Yes", "No"];
        }
        if (options.length < 2)
            return message.reply("Please provide more than two options.");
        if (options.length > emojiList.length)
            return message.reply(
                `Please do not exceed ${emojiList.length} options.`
            );

        let text = `To vote, react using the emojis below.\n ${
            timeout > 0
                ? "The poll will end in **" + timeout + "** seconds."
                : "They poll will **manually end**, as decided by the creator."
        }\n The creator of this poll can end it forcefully using the ${forceEndPollEmoji} emoji.\n\n`;
        const emojiInfo = {};
        for (const option of options) {
            const emoji = emojiList.splice(0, 1);
            emojiInfo[emoji] = { option: option, votes: 0 };
            text += `${emoji} : \`${option}\`\n\n`;
        }
        const usedEmojis = Object.keys(emojiInfo);
        usedEmojis.push(forceEndPollEmoji);

        const poll = await message.channel.send(
            embedBuilder(title, message.author)
                .setDescription(text)
                .setColor("#e4cd3b")
                .setThumbnail(message.guild.iconURL())
        );
        for (const emoji of usedEmojis) await poll.react(emoji);

        const reactionCollector = poll.createReactionCollector(
            (reaction, user) =>
                usedEmojis.includes(reaction.emoji.name) && !user.bot,
            timeout === 0 ? {} : { time: timeout * 1000 }
        );
        const voterInfo = new Map();
        reactionCollector.on("collect", (reaction, user) => {
            if (usedEmojis.includes(reaction.emoji.name)) {
                if (
                    reaction.emoji.name === forceEndPollEmoji &&
                    message.author.id === user.id
                )
                    return reactionCollector.stop();
                if (
                    reaction.emoji.name === forceEndPollEmoji &&
                    message.author.id !== user.id
                )
                    return;
                emojiInfo[reaction.emoji.name].votes = reaction.count - 1;
            }
        });
        reactionCollector.on("end", () => {
            text = "*The poll has ended!*\n The results are:\n\n";
            for (const emoji in emojiInfo)
                text += `• \`${emojiInfo[emoji].option}\` - \`${emojiInfo[emoji].votes} votes\`\n\n`;
            poll.delete();
            message.channel.send(
                embedBuilder(title, message.author).setDescription(text)
            );
        });
    };
    

    const embedBuilder = (title, author) => {
        return new MessageEmbed()
            .setTitle(`Poll - ${title}`)
            .setFooter(
                `Created by ${author.tag}`,
                author.displayAvatarURL()
            );
    };
    voteEmbed(message, title, options, timeout, emojiList, forceEndPollEmoji);
    module.exports = voteEmbed; 
}  

// * STATUS INDICATOR
client.once('ready', () => {
    console.log('Online');
});

// * BOT TOKEN LOGIN
client.login('NzMzODc2MDg4NTQ3MDQ5NDk4.XxJhXg.MmbRA48tr3oCXOJSTYlK4OnQxZg');

// * LOGGER
client.on('messageDelete', message => {
	console.log(`A message by ${message.author.tag} was deleted, but we don't know by who yet.`);
});

// * REQUESTED COMMANDS
client.on('message', message => {
    console.log(message.author.username, ': ', message.content); // logs messages sent

    const member = message.member; // sender
    const msg = message.content.slice(6).trim(); // all message content
    const args = message.content.slice(prefix.length).trim().split(' '); // array of content info
    const command = args.shift().toUpperCase(); // command attached to prefix
    
    if(!message.content.startsWith(prefix) || message.author.bot) return; // if msg doesnt start w/ prefix, return

    else if (command === 'CHANNEL') {
        if (args[0] === "reception") {
            receptionChannel = message.channel.id;
        }
        else if (args[0] === "roles") {
            rolesChannel = message.channel.id;
        }
        else if (args[0] === "announcement") {
            announcementChannel = message.channel.id;
        }
        else if (args[0] === "lobby") {
            lobbyChannel = message.channel.id;
        }
        else if (args[0] === "logs") {
            logsChannel = message.channel.id;
        }
        else if (args[0] === "interact") {
            interactiveChannel = message.channel.id;
        }        
    }

    else if (command === 'DP') {
        if (!message.mentions.users.size) {
            return message.channel.send(`${message.author.displayAvatarURL({ format: "png", dynamic: true })}`);
        }
        const avatarList = message.mentions.users.map(user => {
            return `${user.displayAvatarURL({ format: "png", dynamic: true })}`;
        });
        message.channel.send(avatarList);
    }

    else if (command === 'EVICT') {
        const amount = parseInt(args[0]) + 1;
        if (!message.member.hasPermission("MANAGE_MESSAGES")) { // checks if sender has manage_member perms
                message.channel.send('You are not authorized to use this command.')
                return;
            }
        else if (isNaN(amount)) {
            return message.reply('Please specify how many messages are to be deleted.');
        }
        else if (amount <= 1 || amount > 100) {
            return message.reply('Please specify more than one message to be deleted.');
        }
        message.channel.bulkDelete(amount, true).catch(err => {
            console.error(err);
            message.channel.send('There was an error, please contact a moderator.');
        });
    }

    else if (command === 'ASSIGN') {
        const role = message.guild.roles.cache.find(role => role.name.toUpperCase() === args[0].toUpperCase());
        member.roles.add(role).catch(e => {
            message.reply('there was an error, please follow the format above.')
                .then(msg => {
                    msg.delete({timeout: 7000});
                });
            console.error(e);
        });
        if(role) message.react('👍');
        message.delete({timeout: 6000});  
    }
        
    else if (command === 'REMOVE') {
        const role = message.guild.roles.cache.find(role => role.name.toUpperCase() === args[0].toUpperCase());
        member.roles.remove(role).catch(e => {
            message.reply('there was an error, please follow the format above.')
                .then(msg => {
                    msg.delete({timeout: 7000});
                });
            console.error(e);
        });
        if(role) message.react('👍');
        message.delete({timeout: 6000}); 
    }

    else if (command === 'COUNT') {
        try {
            const role = message.guild.roles.cache.find(role => role.name.toUpperCase() === args[0].toUpperCase());
            message.reply(`There are currently ${role.members.size} members in ${role.name}.`);
            if(role) message.react('👍');
          }
        catch(e) {
            message.reply('there was an error, that role could not be found.')
                .then(msg => {
                    msg.delete({timeout: 7000});
                });
            console.error(e);
            message.react('👎');
          }
    }
    
    else if (command === 'POLL') {
        let title = args[0];
        let timeout = args[1];
        let emojiList = ['⬆️','⬇️','↕️'];
        let forceEndPollEmoji = '💯';
        let options = args.slice(2);
        toVoteEmbed(message, title, options, timeout, emojiList, forceEndPollEmoji);
    }

    else if (command === 'ALLIN') {
        const voiceChannel = message.member.voice.channel;
        console.log(receptionChannel);
        if (!voiceChannel) return message.channel.send("Please join a voice channel");
        voiceChannel.members.forEach(function(guildMember, guildMemberId) {
            console.log(guildMemberId, guildMember.user.username);
            message.channel.send(`<@${guildMemberId}> ${msg}`);
        });
    }

});
        
// * MODULAR
client.on('ready', () => {
    //let server = client.guild.id;
    let dailyUpdatesChannel = client.channels.cache.get('749425029728698399');

    setInterval(() => { // THIS IS THE LOOP WHICH WILL UPDATE THE DAILY UPDATES CHNL WITH WEATHER
        dailyUpdatesChannel.bulkDelete(1);
        response('https://api.openweathermap.org/data/2.5/onecall?lat=45.3876&lon=-75.6960&units=metric&exclude=minutely,current&appid=2083373d69c764744d4561d93e208821', 'https://api.openweathermap.org/data/2.5/weather?lat=45.3876&lon=-75.6960&units=metric&appid=2083373d69c764744d4561d93e208821', dailyUpdatesChannel, 'getWeather');
    }, 3600000);
});




