const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const connectionsDirectoryPath = path.join(__dirname, '../data/connections/followers_and_following');

// Route to display followers
router.get('/followers', async (req, res) => {
    const followersFile = path.join(connectionsDirectoryPath, 'followers_1.json');
    const followersData = JSON.parse(await fs.readFile(followersFile, 'utf8'));
    const followersList = followersData.map(follower => ({
        link: follower.string_list_data[0].href || 'Link n/a',
        username: follower.string_list_data[0].value || 'User n/a',
        time: follower.string_list_data[0].timestamp ? new Date(follower.string_list_data[0].timestamp * 1000).toLocaleString() : 'Unknown Time'
    }));
    res.render('connections/followers', { followersList });
});

// Other connections-related routes (following, etc.)

// Route to display following
router.get('/following', async (req, res) => {
    const followingFile = path.join(connectionsDirectoryPath, 'following.json');
    const followingData = JSON.parse(await fs.readFile(followingFile, 'utf8'));
    const followingList = followingData.relationships_following.map(following => ({
        link: following.string_list_data[0].href || 'Link n/a',
        username: following.string_list_data[0].value || 'User n/a',
        time: following.string_list_data[0].timestamp ? new Date(following.string_list_data[0].timestamp * 1000).toLocaleString() : 'Unknown Time'
    }));
    res.render('connections/following', { followingList });
});

module.exports = router;
