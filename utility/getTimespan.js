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

module.exports = getTimespan; // CommonJS export
