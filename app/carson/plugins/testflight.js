var FormData = require('form-data');
var fs = require('fs');

function TestFlight(teamToken, apiToken, distributionLists) {
    this.teamToken = teamToken
    this.apiToken = apiToken
    this.distributionLists = distributionLists
};

TestFlight.prototype.upload = function upload(ipaPath, dsymPath, callback) {

    var self = this;

    var options = {
        apiToken: this.apiToken,
        teamToken: this.teamToken,
        file: ipaPath,
        notes: "Test",
        dsym: dsymPath,
        distributionLists: this.distributionLists,
        notify: true,
        replace: false
    };

    var form = new FormData();
    form.append('api_token', options.apiToken);
    form.append('team_token', options.teamToken);
    form.append('file', fs.createReadStream(options.file));
    form.append('notes', options.notes);
    form.append('distribution_lists', options.distributionLists);
    form.append('notify', options.notify.toString());
    form.append('replace', options.replace.toString());

    if (/\.ipa$/.test(options.file) && options.dsym) {
        form.append('dsym', fs.createReadStream(options.dsym));
    }

    console.log('Carson-Plugin-Testflight: Now uploading...');

    form.submit("http://testflightapp.com/api/builds.json", function(err, res) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        if (res.statusCode !== 200) {
            console.log('Carson-Plugin-Testflight: Uploading failed with status ' + res.statusCode);
            return callback(false);
        }
        console.log('Carson-Plugin-Testflight: Uploaded ' + options.file + ' to TestFlight!');
        callback(res.body);
    });

};

module.exports = TestFlight;