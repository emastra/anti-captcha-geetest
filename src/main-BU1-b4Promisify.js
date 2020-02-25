const Apify = require('apify');
const { log } = Apify.utils;
const anticaptcha = require('./anticaptcha');
// https://nodejs.org/dist/latest-v8.x/docs/api/util.html#util_util_promisify_original
// const util = require('util');
//
// const readFile = util.promisify(fs.readFile);

/*

currentLocation
gt
challenge
ServerSubdomain O

//

setWebsiteURL(currentLocation);
setWebsiteKey(gt);
setWebsiteChallenge(challenge);


setGeetestApiServerSubdomain('api-na.geetest.com');
setProxyType("http");
setProxyAddress('52.21.149.133');
setProxyPort(proxyPort);
setProxyLogin(proxyLogin);
setProxyPassword(proxyPass);

setUserAgent(userAgent);



*/

Apify.main(async () => {
    const input = await Apify.getInput();
    log.info('Input:');
    console.log(input);

    if (!input) throw new Error('Input must be provided!');
    if (!input.anticaptchaToken) throw new Error('Your anti-captcha token must be provided!');
    if (!input.websiteURL || !input.gt || !input.challenge)
        throw new Error('Input "websiteURL", "gt" and "challenge" are required. Check actor documentation for more info.');

    const {
        websiteURL,
        gt,
        challenge,
        serverSubdomain,
        userAgent,
        proxyType,
        proxyIPAddress,
        proxyPort,
        proxyLogin,
        proxyPass,
    } = input;

    const anticaptcha = require('./anticaptcha')(input.anticaptchaToken);

    log.info('Configuring anticapatcha task...');

    anticaptcha.setWebsiteURL(websiteURL); //.split('?')[0]
    anticaptcha.setWebsiteKey(gt);
    anticaptcha.setWebsiteChallenge(challenge);
    if (serverSubdomain)
        anticaptcha.setGeetestApiServerSubdomain(serverSubdomain);
    if (userAgent)
        anticaptcha.setUserAgent(userAgent);
    // if (input.websiteCookies)

    if (proxyType || proxyIPAddress || proxyPort || proxyLogin || proxyPass) {
        if (proxyType && proxyIPAddress && proxyPort)
            throw new Error('If you want to provide proxy, "proxyType", "proxyIPAddress" and "proxyPort" are required.');

        anticaptcha.setProxyType(proxyType);
        anticaptcha.setProxyAddress(proxyIPAddress);
        anticaptcha.setProxyPort(proxyPort);
        if (proxyLogin)
            anticaptcha.setProxyLogin(proxyLogin);
        if (proxyPass)
            anticaptcha.setProxyPassword(proxyPass);
    }

    log.info('Solving geetest for ' + input.websiteURL);

    // Solving
    anticaptcha.getBalance(function (err, balance) {
        if (err) {
            log.error(err);
            return;
        }

        if (balance > 0) {
            anticaptcha.createGeeTestTask(function (err, taskId) {
                if (err) {
                    log.error(err);
                    return;
                }

                log.info('taskId: ' + taskId);

                anticaptcha.getTaskSolution(taskId, async function (err, taskSolution) {
                    if (err) {
                        log.error(err);
                        return;
                    }

                    // got solution
                    log.info('Solution received successfully.');
                    await Apify.setValue('OUTPUT', taskSolution);
                    log.info('Solution is saved to OUTPUT.');
                    log.info(`Solution printed:
                        ${taskSolution}
                    `);
                });
            });
        }
    });

    log.info('Task finished.');
});
