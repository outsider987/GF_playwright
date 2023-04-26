const express = require('express');
const app = express();

const updateInfo = {
    version: '1.0.0',
    url: 'https://example.com/update/myapp-1.0.0.dmg',
    releaseNotes: 'Bug fixes and improvements',
};

app.get('/update/:platform/:version', (req, res) => {
    const platform = req.params.platform;
    const clientVersion = req.params.version;

    if (clientVersion === updateInfo.version) {
        res.status(204).send(); // No content - client is up-to-date
    } else {
        res.json(updateInfo); // Return update info
    }
});

app.listen(3000, () => {
    console.log('Update server listening on port 3000');
});