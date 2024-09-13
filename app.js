const express = require('express');
const path = require('path');
const app = express();

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Import Routes
const adsRoutes = require('./routes/ads');
const connectionsRoutes = require('./routes/connections');
const activityRoutes = require('./routes/activity');
const messagesRoutes = require('./routes/messages');
const securityRoutes = require('./routes/security');

// Use Routes
app.use('/ads', adsRoutes);
app.use('/connections', connectionsRoutes);
app.use('/activity', activityRoutes);
app.use('/messages', messagesRoutes);
app.use('/security', securityRoutes);

// Home route
app.get('/', (req, res) => {
    const items = [
        { name: 'Messages', route: '/messages' },
        { name: 'Seen Ads', route: '/ads/viewed' },
        { name: 'Seen Posts', route: '/ads/posts_viewed' },
        { name: 'Viewed suggested accounts', route: '/ads/suggested_accounts_viewed' },
        { name: 'Watched Videos', route: '/ads/videos_watched' },
        { name: 'Followers', route: '/connections/followers' },
        { name: 'Following', route: '/connections/following' },
        //{ name: 'Viewed Web Links', route: '/activity/link_history' },
        { name: 'Posted Comments', route: '/activity/comments' },
        { name: 'Login Activity', route: '/security/login_activity' },
        { name: 'Advertisers', route: '/ads/advertisers' }
    ];

    res.render('index', { items });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
