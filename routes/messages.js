const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const activityDirectory = path.join(__dirname, '../data/your_instagram_activity/messages/inbox');

// Route to display messages
router.get('/', async (req, res) => {
    const users = (await fs.readdir(activityDirectory)).filter(async (user) => {
        return (await fs.stat(path.join(activityDirectory, user))).isDirectory();
    });
    const count = users.length;
    res.render('activity/messages', { count, users });
});

// Other messages-related routes
// Route to display specific message thread
router.get('/:username', async (req, res) => {
    const username = req.params.username;
    const messageFile = path.join(activityDirectory, 'messages', 'inbox', username, 'message_1.json');
    try {
        const messageData = JSON.parse(await fs.readFile(messageFile, 'utf8'));
        messageData.messages = messageData.messages.map(message => {
            if (message.content) {
                message.content = decodeURIComponent(escape(message.content));
            }
            return message;
        });
        res.render('activity/messages_thread', {
            user: messageData.participants[0].name,
            messages: messageData.messages,
        });
    } catch (err) {
        res.status(404).send('Message not found for user ' + username);
    }
});

module.exports = router;
