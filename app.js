const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const ipinfo = require('ipinfo');

const app = express();

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Directory paths
const adsAndTopicsDirectoryPath = path.join(__dirname, 'data', 'ads_information', 'ads_and_topics');
const instagramAdsDirectoryPath = path.join(__dirname, 'data', 'ads_information', 'instagram_ads_and_businesses');
const connectionsDirectoryPath = path.join(__dirname, 'data', 'connections', 'followers_and_following');
const linkHistoryDirectory = path.join(__dirname, 'data', 'logged_information', 'link_history');
const activityDirectory = path.join(__dirname, 'data', 'your_instagram_activity');
// Determine the correct login directory based on which folder exists
const loginInformationDirectoryAccount = path.join(__dirname, 'data', 'security_and_login_information', 'login_and_account_creation');
const loginInformationDirectoryProfile = path.join(__dirname, 'data', 'security_and_login_information', 'login_and_profile_creation');

let loginInformationDirectory = loginInformationDirectoryAccount; // Default to 'login_and_account_creation'

(async () => {
    try {
        // Check if the 'login_and_account_creation' folder exists
        await fs.access(loginInformationDirectoryAccount);
    } catch (error) {
        // If 'login_and_account_creation' doesn't exist, check for 'login_and_profile_creation'
        try {
            await fs.access(loginInformationDirectoryProfile);
            loginInformationDirectory = loginInformationDirectoryProfile;
        } catch (err) {
            console.error('Neither login_and_account_creation nor login_and_profile_creation folder exists.');
            process.exit(1); // Exit the application if neither folder exists
        }
    }
})();


// Helper function to get timespan (min and max timestamps) for a dataset
function getTimespan(data) {
    const timestamps = data.map(item => item.string_map_data.Time.timestamp);
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    return {
        start: new Date(minTime * 1000).toLocaleString(),
        end: new Date(maxTime * 1000).toLocaleString()
    };
}

// Route for the home page
app.get('/', (req, res) => {
    const items = [
        { name: 'Ads Viewed', route: '/ads_viewed' },
        { name: 'Posts Viewed', route: '/posts_viewed' },
        { name: 'Suggested Profiles Viewed', route: '/suggested_accounts_viewed' },
        { name: 'Watched Videos', route: '/videos_watched' },
        { name: 'Followers', route: '/followers' },
        { name: 'Following', route: '/following' },
        { name: 'Link History', route: '/link_history' },
        { name: 'Comments', route: '/comments' },
        { name: 'Reel Comments', route: '/reel_comments' },
        { name: 'Liked Posts', route: '/liked_posts' },
        { name: 'Liked Comments', route: '/liked_comments' },
        { name: 'Messages', route: '/messages' },
        { name: 'Login Activity', route: '/login_activity' },
        { name: 'Advertisers', route: '/advertisers_using_your_activity_or_information' }
    ];

    res.render('index', { items });
});

// Route to display ads viewed
app.get('/ads_viewed', async (req, res) => {
    const adsFile = path.join(adsAndTopicsDirectoryPath, 'ads_viewed.json');
    const adsData = JSON.parse(await fs.readFile(adsFile, 'utf8'));
    const adCounts = adsData.impressions_history_ads_seen.reduce((counts, ad) => {
        const author = ad.string_map_data.Author ? ad.string_map_data.Author.value : 'Unknown';
        counts[author] = (counts[author] || 0) + 1;
    return counts;
    }, {});
    const adTimespan = getTimespan(adsData.impressions_history_ads_seen);
    res.render('ads_information/ads_and_topics/ads_viewed', { adCounts, adTimespan });
});

// Route to display posts viewed
app.get('/posts_viewed', async (req, res) => {
    const postsFile = path.join(adsAndTopicsDirectoryPath, 'posts_viewed.json');
    const postsData = JSON.parse(await fs.readFile(postsFile, 'utf8'));
    const postCounts = postsData.impressions_history_posts_seen.reduce((counts, post) => {
        const author = post.string_map_data.Author ? post.string_map_data.Author.value : 'Unknown';
        counts[author] = (counts[author] || 0) + 1;
    return counts;
    }, {});
    const postTimespan = getTimespan(postsData.impressions_history_posts_seen);
    res.render('ads_information/ads_and_topics/posts_viewed', { postCounts, postTimespan });
});

// Route to display suggested accounts viewed
app.get('/suggested_accounts_viewed', async (req, res) => {
    const suggestedProfilesFile = path.join(adsAndTopicsDirectoryPath, 'suggested_profiles_viewed.json');
    const suggestedAccountsFile = path.join(adsAndTopicsDirectoryPath, 'suggested_accounts_viewed.json');

    const fileToUse = await fs.access(suggestedProfilesFile).then(() => suggestedProfilesFile).catch(() => suggestedAccountsFile);
    const suggestedAccountsData = JSON.parse(await fs.readFile(fileToUse, 'utf8'));
    const suggestedAccountsList = suggestedAccountsData.impressions_history_chaining_seen.map(account => {
        return {
            username: account.string_map_data.Username ? account.string_map_data.Username.value : 'Unknown Username',
            time: account.string_map_data.Time ? new Date(account.string_map_data.Time.timestamp * 1000).toLocaleString() : 'Unknown Time'
        };
    });

    res.render('ads_information/ads_and_topics/suggested_accounts_viewed', { suggestedAccountsList });
});

// Route to display videos watched
app.get('/videos_watched', async (req, res) => {
    const videosFile = path.join(adsAndTopicsDirectoryPath, 'videos_watched.json');
    const videosData = JSON.parse(await fs.readFile(videosFile, 'utf8'));
    const videosWatchedCounts = videosData.impressions_history_videos_watched.reduce((counts, video) => {
        const author = video.string_map_data.Author ? video.string_map_data.Author.value : 'Unknown';
        counts[author] = (counts[author] || 0) + 1;
    return counts;
    }, {});
    const videoTimespan = getTimespan(videosData.impressions_history_videos_watched);
    res.render('ads_information/ads_and_topics/videos_watched', { videosWatchedCounts, videoTimespan });
});

// Route to display followers
app.get('/followers', async (req, res) => {
    const followersFile = path.join(connectionsDirectoryPath, 'followers_1.json');
    const followersData = JSON.parse(await fs.readFile(followersFile, 'utf8'));
    const followersList = followersData.map(follower => ({
        link: follower.string_list_data[0].href || 'Link n/a',
        username: follower.string_list_data[0].value || 'User n/a',
        time: follower.string_list_data[0].timestamp ? new Date(follower.string_list_data[0].timestamp * 1000).toLocaleString() : 'Unknown Time'
    }));
    res.render('connections/followers', { followersList });
});

// Route to display following
app.get('/following', async (req, res) => {
    const followingFile = path.join(connectionsDirectoryPath, 'following.json');
    const followingData = JSON.parse(await fs.readFile(followingFile, 'utf8'));
    const followingList = followingData.relationships_following.map(following => ({
        link: following.string_list_data[0].href || 'Link n/a',
        username: following.string_list_data[0].value || 'User n/a',
        time: following.string_list_data[0].timestamp ? new Date(following.string_list_data[0].timestamp * 1000).toLocaleString() : 'Unknown Time'
    }));
    res.render('connections/following', { followingList });
});

// Route to display link history
app.get('/link_history', async (req, res) => {
    const linkHistoryFile = path.join(linkHistoryDirectory, 'link_history.json');
    const linkHistoryData = JSON.parse(await fs.readFile(linkHistoryFile, 'utf8'));
    const loggedInformationList = linkHistoryData.map(log => {
        const pageUrl = log.label_values.find(item => item.ent_field_name === 'PageURL')?.value || 'N/A';
        const pageTitle = log.label_values.find(item => item.ent_field_name === 'PageTitle')?.value || 'N/A';
        const startTime = log.label_values.find(item => item.ent_field_name === 'StartTime')?.value || 'Unknown Time';
        const endTime = log.label_values.find(item => item.ent_field_name === 'EndTime')?.value || 'Unknown Time';
        return { pageUrl, pageTitle, startTime, endTime };
    });
    res.render('link_history/link_history', { loggedInformationList });
});

// Route to display comments
app.get('/comments', async (req, res) => {
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

// Route to display reel comments
app.get('/reel_comments', async (req, res) => {
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
app.get('/liked_posts', async (req, res) => {
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
app.get('/liked_comments', async (req, res) => {
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

// Route to display messages
app.get('/messages', async (req, res) => {
    const inboxDirectory = path.join(activityDirectory, 'messages', 'inbox');
    const users = (await fs.readdir(inboxDirectory)).filter(async (user) => {
        return (await fs.stat(path.join(inboxDirectory, user))).isDirectory();
    });
    const count = users.length;
    res.render('activity/messages', { count, users });
});

// Route to display specific message thread
app.get('/messages/:username', async (req, res) => {
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

// Route to display login activity with location info from IP address
app.get('/login_activity', async (req, res) => {
    const loginActivityFile = path.join(loginInformationDirectory, 'login_activity.json');
    const loginActivityData = JSON.parse(await fs.readFile(loginActivityFile, 'utf8'));

    const getLocationFromIP = async (ip) => {
        try {
            const response = await ipinfo(ip);
            return `${response.city}, ${response.region}, ${response.country}`;
        } catch (error) {
            console.error(`Error fetching location for IP ${ip}:`, error);
            return 'Unknown Location';
        }
    };

    const loginActivityList = await Promise.all(
        loginActivityData.account_history_login_history.map(async (login) => {
            const device = login.string_map_data['User Agent']?.value || 'Unknown Device';
            const ipAddress = login.string_map_data['IP Address']?.value || 'Unknown IP Address';
            const timestamp = login.string_map_data['Time']?.timestamp || null;
            const formattedTime = timestamp ? new Date(timestamp * 1000).toLocaleString() : 'Unknown Time';
            const location = ipAddress !== 'Unknown IP Address' ? await getLocationFromIP(ipAddress) : 'Unknown Location';

            return {
                device,
                location,
                time: formattedTime
            };
        })
    );

    res.render('activity/login_activity', { loginActivityList });
});

// Route to display advertisers using your activity or information
app.get('/advertisers_using_your_activity_or_information', async (req, res) => {
    const advertisersFile = path.join(instagramAdsDirectoryPath, 'advertisers_using_your_activity_or_information.json');
    const advertisersData = JSON.parse(await fs.readFile(advertisersFile, 'utf8'));

    // Mapping advertisers to an array of relevant details
    const advertisersList = advertisersData.ig_custom_audiences_all_types.map(advertiser => ({
        name: advertiser.advertiser_name,
        hasDataFileCustomAudience: advertiser.has_data_file_custom_audience,
        hasRemarketingCustomAudience: advertiser.has_remarketing_custom_audience,
        hasInPersonStoreVisit: advertiser.has_in_person_store_visit
    }));

    // Rendering the view with the list of advertisers
    res.render('ads_information/ads_and_topics/advertisers_using_your_activity_or_information', { advertisersList });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
