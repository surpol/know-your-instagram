const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const activityDirectory = path.join(__dirname, '../data/your_instagram_activity');

// Route to display comments
router.get('/comments', async (req, res) => {
    const commentsFile = path.join(activityDirectory, 'comments', 'post_comments_1.json');
    const commentsData = JSON.parse(await fs.readFile(commentsFile, 'utf8'));
    const commentsList = commentsData.map(comment => ({
        comment: decodeURIComponent(escape(comment.string_map_data.Comment?.value || 'No Comment')),
        mediaOwner: decodeURIComponent(escape(comment.string_map_data?.['Media Owner']?.value || 'Unknown Owner')),
        time: comment.string_map_data.Time.timestamp ? new Date(comment.string_map_data.Time.timestamp * 1000).toLocaleString() : 'Unknown Time'
    }));
    const totalComments = commentsList.length;
    res.render('activity/comments', { totalComments, commentsList });
});

// Other activity-related routes (reel comments, liked posts, etc.)
// Route to display reel comments
router.get('/reel_comments', async (req, res) => {
    const commentsFile = path.join(activityDirectory, 'comments', 'reels_comments.json');
    const commentsData = JSON.parse(await fs.readFile(commentsFile, 'utf8'));
    const commentsList = commentsData.comments_reels_comments.map(comment => ({
        comment: decodeURIComponent(escape(comment.string_map_data.Comment?.value || 'No Comment')),
        mediaOwner: decodeURIComponent(escape(comment.string_map_data?.['Media Owner']?.value || 'Unknown Owner')),
        time: comment.string_map_data.Time.timestamp ? new Date(comment.string_map_data.Time.timestamp * 1000).toLocaleString() : 'Unknown Time'
    }));
    const totalComments = commentsList.length;
    res.render('activity/comments', { totalComments, commentsList });
});

// Route to display liked posts
router.get('/liked_posts', async (req, res) => {
    const likesFile = path.join(activityDirectory, 'likes', 'liked_posts.json');
    const likesData = JSON.parse(await fs.readFile(likesFile, 'utf8'));
    const organizedLikes = {};
    likesData.likes_media_likes.forEach(like => {
        const title = like.title || 'Untitled';
        const hrefs = like.string_list_data.map(data => data.href);
        if (!organizedLikes[title]) {
            organizedLikes[title] = [];
        }
        organizedLikes[title].push(...hrefs);
    });
    const likedCount = likesData.likes_media_likes.length;
    res.render('activity/liked_posts', { likedCount, organizedLikes });
});

// Route to display liked comments
router.get('/liked_comments', async (req, res) => {
    const likesFile = path.join(activityDirectory, 'likes', 'liked_comments.json');
    const likesData = JSON.parse(await fs.readFile(likesFile, 'utf8'));
    const organizedLikes = {};
    likesData.likes_comment_likes.forEach(like => {
        const title = like.title || 'Untitled';
        const hrefs = like.string_list_data.map(data => data.href);
        if (!organizedLikes[title]) {
            organizedLikes[title] = [];
        }
        organizedLikes[title].push(...hrefs);
    });
    const likedCount = likesData.likes_comment_likes.length;
    res.render('activity/liked_comments', { likedCount, organizedLikes });
});

module.exports = router;
