const moodleService = require('../utils/moodleService');

exports.getSsoUrl = async (req, res) => {
  try {
    const { username } = req.user; // Assuming req.user is set by verifyToken middleware
    if (!username) {
      return res.status(400).json({ message: "Username is missing from token." });
    }

    const response = await moodleService.getSSOToken(username);
    
    if (response.loginurl) {
      res.json({ ssoUrl: response.loginurl });
    } else {
      res.status(400).json({ message: "Moodle SSO URL not generated.", details: response });
    }
  } catch (error) {
    console.error("❌ SSO Error:", error.message);
    res.status(500).json({ error: "Failed to generate Moodle SSO link." });
  }
};
