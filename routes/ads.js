const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const getTimespan = require('../utility/getTimespan.js');

const adsAndTopicsDirectoryPath = path.join(__dirname, '../data/ads_information/ads_and_topics');

// Route to display ads viewed
router.get('/viewed', async (req, res) => {
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

// Other ad-related routes (posts viewed, suggested accounts viewed, etc.)
// Route to display posts viewed
router.get('/posts_viewed', async (req, res) => {
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
router.get('/suggested_accounts_viewed', async (req, res) => {
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

const instagramAdsDirectoryPath = path.join(__dirname, 'data', 'ads_information', 'instagram_ads_and_businesses');

// Route to display advertisers using your activity or information
router.get('/advertisers', async (req, res) => {
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

// Route to display suggested accounts viewed
router.get('/videos_watched', async (req, res) => {
        // Videos watched
    const videosWatched = path.join(adsAndTopicsDirectoryPath, 'videos_watched.json');
    const videosWatchedData = JSON.parse(await fs.readFile(videosWatched, 'utf8'));
    const videosWatchedCounts = videosWatchedData.impressions_history_videos_watched.reduce((counts, video) => {
        const author = video.string_map_data.Author ? video.string_map_data.Author.value : 'Unknown';
        counts[author] = (counts[author] || 0) + 1;
        return counts;
    }, {});
    const videoTimespan = getTimespan(videosWatchedData.impressions_history_videos_watched);

    res.render('ads_information/ads_and_topics/videos_watched', { videosWatchedCounts, videoTimespan });
});


module.exports = router;
