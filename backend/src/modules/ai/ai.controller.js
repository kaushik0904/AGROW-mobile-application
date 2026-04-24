const chat = async (req, res) => {
  try {
    const { message, image_url } = req.body;
    
    let responseText = '';
    
    if (image_url) {
      responseText = "Based on the image you've uploaded, it appears to show early signs of nitrogen deficiency. I recommend applying a nitrogen-rich fertilizer slightly earlier than your usual schedule. Keep monitoring the leaf color over the next week.";
    } else {
      const lowerMessage = (message || '').toLowerCase();
      if (lowerMessage.includes('price') || lowerMessage.includes('market') || lowerMessage.includes('sell')) {
        responseText = "Current market trends indicate a slight uptick in prices for vegetables towards the weekend. It might be profitable to hold standard crops for a couple of days if storage allows.";
      } else if (lowerMessage.includes('weather') || lowerMessage.includes('rain')) {
        responseText = "Checking the local weather patterns, there is a 40% chance of rain this evening. Delay any pesticide application until tomorrow morning.";
      } else {
        responseText = "That's an interesting farming query. Based on best agronomic practices, ensuring proper soil moisture and regular pest scouting will keep your yield optimal. How else can I assist you?";
      }
    }

    setTimeout(() => {
      res.status(200).json({ reply: responseText });
    }, 1500);

  } catch (error) {
    console.error('Error in AI chat endpoint:', error);
    res.status(500).json({ error: 'Internal server error from AI endpoint' });
  }
};

module.exports = {
  chat
};
