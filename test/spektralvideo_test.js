//Casperjs test for SpektralVideo.js
var
    environment,
    debug = true,
    capturePath = 'test/captures/';

//Determine environment
//http://localhost/spektralvideo/
environment= casper.cli.args[1] || "http://spektraldevelopment.com/projects/spektralvideo/";
casper.echo("Environment is: " + environment);

//Configure options
casper.options.viewportSize = { width: 1024, height: 768 };

//Utils
function screenshot(fileName) {
    if (debug === true) {
        casper.capture(capturePath + fileName + ".jpg");
    }
};

//Start test
casper.test.begin('Spektral Video Test', 1, function suite(test) {
    casper.start(environment, function() {
        if (debug === true) {
            screenshot('pageReady');
        }
        casper.waitForSelector('#theVideo');
    });

    casper.then(function() {
        screenshot('theVideo');
    });

    casper.run(function() {
        casper.echo('Test done.');
        test.done();
    });
});
