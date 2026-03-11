module.exports = ({ prisma }) => {
  return {
    CHAT_MESSAGE: async (data) => {
      // data: { serverId, chat, steamId, name, message }
      // This simple plugin just logs high priority messages
      if (data.message.includes('!admin') || data.message.includes('help')) {
        console.log(`[PLUGIN-EXAMPLE] High priority message from ${data.name}: ${data.message}`);
        
        // Example: You could save this to a special notification table or send a Discord webhook
      }
    }
  };
};
