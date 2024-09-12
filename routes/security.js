const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const ipinfo = require('ipinfo');

// Define paths
const loginInformationDirectoryAccount = path.join(__dirname, '..', 'data', 'security_and_login_information', 'login_and_account_creation');
const loginInformationDirectoryProfile = path.join(__dirname, '..', 'data', 'security_and_login_information', 'login_and_profile_creation');

let loginInformationDirectory = loginInformationDirectoryAccount; // Default to 'login_and_account_creation'

async function determineLoginDirectory() {
    try {
        await fs.access(loginInformationDirectoryAccount);
    } catch (error) {
        try {
            await fs.access(loginInformationDirectoryProfile);
            loginInformationDirectory = loginInformationDirectoryProfile; // Only change if profile directory exists
        } catch (err) {
            console.error('Neither login_and_account_creation nor login_and_profile_creation folder exists.');
            process.exit(1); // Exit the application if neither folder exists
        }
    }
}

determineLoginDirectory(); // Invoke the function to determine the correct directory

// Use loginInformationDirectory as needed in your routes or other logic

// Route to display login activity with location info from IP address
router.get('/login_activity', async (req, res) => {
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

module.exports = router;
