const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const ipinfo = require("ipinfo");

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Directory paths
const baseDirectory = path.join(__dirname, 'data');
const adsAndTopicsDirectoryPath = path.join(__dirname, 'data', 'ads_information', 'ads_and_topics');
const connectionsDirectoryPath = path.join(__dirname, 'data', 'connections', 'followers_and_following');
const linkHistoryDirectory = path.join(__dirname, 'data', 'logged_information', 'link_history');
const activityDirectory = path.join(__dirname, 'data', 'your_instagram_activity');
const loginInformationDirectory = path.join(__dirname, 'data', 'security_and_login_information', 'login_and_account_creation');


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

// Ads viewed
const adsViewed = path.join(adsAndTopicsDirectoryPath, 'ads_viewed.json');
// Read and parse the JSON files
const adsData = JSON.parse(fs.readFileSync(adsViewed, 'utf8'));
// Count the occurrences of each ad (Author) and get the timespan
const adCounts = adsData.impressions_history_ads_seen.reduce((counts, ad) => {
    const author = ad.string_map_data.Author ? ad.string_map_data.Author.value : 'Unknown Author';
    counts[author] = (counts[author] || 0) + 1;
    return counts;
}, {});
const adTimespan = getTimespan(adsData.impressions_history_ads_seen);


// Posts Viewed 
const postsViewed = path.join(adsAndTopicsDirectoryPath, 'posts_viewed.json');
const postsData = JSON.parse(fs.readFileSync(postsViewed, 'utf8'));
// Count the occurrences of each post (Author) and get the timespan
const postCounts = postsData.impressions_history_posts_seen.reduce((counts, post) => {
    const author = post.string_map_data.Author ? post.string_map_data.Author.value : 'Unknown Author';
    counts[author] = (counts[author] || 0) + 1;
    return counts;
}, {});
const postTimespan = getTimespan(postsData.impressions_history_posts_seen);

// File paths 
const suggestedAccountsViewed = path.join(adsAndTopicsDirectoryPath, 'suggested_accounts_viewed.json');
const suggestedAccountsData = JSON.parse(fs.readFileSync(suggestedAccountsViewed, 'utf8'));
// Suggested accounts data processing (optional)
const suggestedAccountsList = suggestedAccountsData.impressions_history_chaining_seen.map(account => {
    return {
        username: account.string_map_data.Username ? account.string_map_data.Username.value : 'Unknown Username',
        time: account.string_map_data.Time ? new Date(account.string_map_data.Time.timestamp * 1000).toLocaleString() : 'Unknown Time'
    };
});

// Videos watched
const videosWatched = path.join(adsAndTopicsDirectoryPath, 'videos_watched.json');
const videosWatchedData = JSON.parse(fs.readFileSync(videosWatched, 'utf8'));
const videosWatchedCounts = videosWatchedData.impressions_history_videos_watched.reduce((counts, video) => {
    const author = video.string_map_data.Author ? video.string_map_data.Author.value : 'Unknown Author';
    counts[author] = (counts[author] || 0) + 1;
    return counts;
}, {});
const videoTimespan = getTimespan(videosWatchedData.impressions_history_videos_watched);

// Followers and following
const followers = path.join(connectionsDirectoryPath, 'followers_1.json');
const followersData = JSON.parse(fs.readFileSync(followers, 'utf8'));
const followersList = followersData.map(follower => {
    return {
        link: follower.string_list_data[0].href ? follower.string_list_data[0].href : 'Link n/a',
        username: follower.string_list_data[0].value ? follower.string_list_data[0].value : 'User n/a',
        time: follower.string_list_data[0].timestamp ? new Date(follower.string_list_data[0].timestamp * 1000).toLocaleString() : 'Unknown Time'
    };
});

// Followers and following
const following = path.join(connectionsDirectoryPath, 'following.json');
const followingData = JSON.parse(fs.readFileSync(following, 'utf8'));
const followingList = followingData.relationships_following.map(following => {
    return {
        link: following.string_list_data[0].href ? following.string_list_data[0].href : 'Link n/a',
        username: following.string_list_data[0].value ? following.string_list_data[0].value : 'User n/a',
        time: following.string_list_data[0].timestamp ? new Date(following.string_list_data[0].timestamp * 1000).toLocaleString() : 'Unknown Time'
    };
});

// Link history
const loggedInformation = path.join(linkHistoryDirectory, 'link_history.json');
const loggedInformationData = JSON.parse(fs.readFileSync(loggedInformation, 'utf8'));
const loggedInformationList = loggedInformationData.map(log => {
    const pageUrl = log.label_values.find(item => item.ent_field_name === 'PageURL')?.value || 'N/A';
    const pageTitle = log.label_values.find(item => item.ent_field_name === 'PageTitle')?.value || 'N/A';
    const startTime = log.label_values.find(item => item.ent_field_name === 'StartTime')?.value || 'Unknown Time';
    const endTime = log.label_values.find(item => item.ent_field_name === 'EndTime')?.value || 'Unknown Time';

    return {
        pageUrl,
        pageTitle,
        startTime,
        endTime
    };
});
    
// Route for the home page
app.get('/', (req, res) => {
    const items = [
        { name: 'Ads Viewed', route: '/ads_viewed' },
        { name: 'Posts Viewed', route: '/posts_viewed' },
        { name: 'Suggested Accounts Viewed', route: '/suggested_accounts_viewed' },
        { name: 'Watched Videos', route: '/videos_watched' },
        { name: 'Followers', route: '/followers' },
        { name: 'Following', route: '/following' },
        { name: 'Link History', route: '/link_history' },
        { name: 'Comments', route: '/comments' },
        { name: 'Reel Comments', route: '/reel_comments' },
        { name: 'Liked Posts', route: '/liked_posts' },
        { name: 'Liked Comments', route: '/liked_comments' },
        { name: 'Messages', route: '/messages' },
        { name: 'Login Activity', route: '/login_activity' }


    ];        

    res.render('index', { items});
});

// Route to display ads viewed and occurrences with timespan
app.get('/ads_viewed', (req, res) => {
    res.render('ads_information/ads_and_topics/ads_viewed', { adCounts, adTimespan });
});

// Route to display posts viewed and occurrences with timespan
app.get('/posts_viewed', (req, res) => {
    res.render('ads_information/ads_and_topics/posts_viewed', { postCounts, postTimespan });
});

// Route to display suggested accounts viewed
app.get('/suggested_accounts_viewed', (req, res) => {
    res.render('ads_information/ads_and_topics/suggested_accounts_viewed', { suggestedAccountsList });
});

// Route to display suggested accounts viewed
app.get('/videos_watched', (req, res) => {
    res.render('ads_information/ads_and_topics/videos_watched', { videosWatchedCounts, videoTimespan });
});

// Route to display followers
app.get('/followers', (req, res) => {
    res.render('connections/followers', { followersList });
});

// Route to display followers
app.get('/following', (req, res) => {
    res.render('connections/following', { followingList });
});

// Pass the list to the EJS template
app.get('/link_history', (req, res) => {
    res.render('link_history/link_history', { loggedInformationList });
});

app.get('/comments', (req, res) => {
    const comments = path.join(activityDirectory, 'comments','post_comments_1.json');
    const commentsData = JSON.parse(fs.readFileSync(comments, 'utf8'));

    const commentsList = commentsData.map(comment => {
        const commentText = comment.string_map_data.Comment?.value || 'No Comment';
        const mediaOwner = comment.string_map_data?.['Media Owner']?.value || 'Unknown Owner';
        const timestamp = comment.string_map_data.Time.timestamp || null;
        const formattedTime = timestamp ? new Date(timestamp * 1000).toLocaleString() : 'Unknown Time';

        return {
            comment: commentText,
            mediaOwner,
            time: formattedTime
        };
    });
    const totalComments = commentsList.length;
    res.render('activity/comments', { totalComments,commentsList });
});

app.get('/reel_comments', (req, res) => {
    const comments = path.join(activityDirectory, 'comments', 'reels_comments.json');
    const commentsData = JSON.parse(fs.readFileSync(comments, 'utf8'));

    const commentsList = commentsData.comments_reels_comments.map(comment => {
        const commentText = comment.string_map_data.Comment?.value || 'No Comment';
        const mediaOwner = comment.string_map_data?.['Media Owner']?.value || 'Unknown Owner';
        const timestamp = comment.string_map_data.Time.timestamp || null;
        const formattedTime = timestamp ? new Date(timestamp * 1000).toLocaleString() : 'Unknown Time';

        return {
            comment: commentText,
            mediaOwner,
            time: formattedTime
        };

    });
    const totalComments = commentsList.length;
    res.render('activity/comments', { totalComments,commentsList });
});

app.get('/liked_posts', (req, res) => {
    // Define the path to the liked posts JSON file
    const likes = path.join(activityDirectory, 'likes', 'liked_posts.json');

    // Read and parse the JSON file
    const likesData = JSON.parse(fs.readFileSync(likes, 'utf8'));

    // Organize likes by title and collect the associated URLs
    const organizedLikes = {};

    likesData.likes_media_likes.forEach(like => {
        const title = like.title || 'Untitled'; // Default to 'Untitled' if no title exists
        const hrefs = like.string_list_data.map(data => data.href); // Extract the href URLs

        if (!organizedLikes[title]) {
            organizedLikes[title] = [];
        }

        organizedLikes[title].push(...hrefs); // Add the URLs to the array for this title
    });
    const likedCount = likesData.likes_media_likes.length;
    // Render the EJS template, passing the organized likes
    res.render('activity/liked_posts', { likedCount,organizedLikes });
});


app.get('/liked_comments', (req, res) => {
    // Define the path to the liked posts JSON file
    const likes = path.join(activityDirectory, 'likes', 'liked_comments.json');

    // Read and parse the JSON file
    const likesData = JSON.parse(fs.readFileSync(likes, 'utf8'));

    // Organize likes by title and collect the associated URLs
    const organizedLikes = {};

    likesData.likes_comment_likes.forEach(like => {
        const title = like.title || 'Untitled'; // Default to 'Untitled' if no title exists
        const hrefs = like.string_list_data.map(data => data.href); // Extract the href URLs

        if (!organizedLikes[title]) {
            organizedLikes[title] = [];
        }

        organizedLikes[title].push(...hrefs); // Add the URLs to the array for this title
    });

    // Render the EJS template, passing the organized likes
    res.render('activity/liked_comments', { organizedLikes });
});

// Route to display usernames
app.get('/messages', (req, res) => {
    const inboxDirectory = path.join(activityDirectory, 'messages', 'inbox');

    // Get the list of directories (usernames)
    const users = fs.readdirSync(inboxDirectory).filter(user => {
        return fs.lstatSync(path.join(inboxDirectory, user)).isDirectory();
    });

    res.render('activity/messages', { users });
});

app.get('/messages/:username', (req, res) => {
    const username = req.params.username;
    const messageFile = path.join(activityDirectory, 'messages', 'inbox', username, 'message_1.json');

    if (fs.existsSync(messageFile)) {
        const messageData = JSON.parse(fs.readFileSync(messageFile, 'utf8'));

        // Decode emojis in content
        messageData.messages = messageData.messages.map(message => {
            if (message.content) {
                message.content = decodeURIComponent(escape(message.content));
            }
            return message;
        });

        res.render('activity/messages_thread', { 
            user: messageData.participants[0].name, 
            messages: messageData.messages // Pass the messages array
        });
    } else {
        res.status(404).send('Message not found for user ' + username);
    }
});

// Route to display login activity with location info from IP address
app.get('/login_activity', async (req, res) => {
    const loginActivity = path.join(loginInformationDirectory, 'login_activity.json');
    const loginActivityData = JSON.parse(fs.readFileSync(loginActivity, 'utf8'));

    // Helper function to fetch location from IP using ipinfo
    const getLocationFromIP = async (ip) => {
        try {
            const response = await ipinfo(ip);
            return `${response.city}, ${response.region}, ${response.country}`;
        } catch (error) {
            console.error(`Error fetching location for IP ${ip}:`, error);
            return 'Unknown Location';
        }
    };

    // Map over the login activity data and enrich it with location information
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

    // Render the login_activity.ejs template with the enriched data
    res.render('activity/login_activity', { loginActivityList });
});




// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
