const Apify = require('apify');
const { log } = Apify.utils;
const util = require('util');
const anti_captcha = require('./anticaptcha');

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

    const anticaptcha = anti_captcha(input.anticaptchaToken);

    anticaptcha.getBalance = util.promisify(anticaptcha.getBalance);
    anticaptcha.createGeeTestTask = util.promisify(anticaptcha.createGeeTestTask);
    anticaptcha.getTaskSolution = util.promisify(anticaptcha.getTaskSolution);

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
        if (!proxyType || !proxyIPAddress || !proxyPort)
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
    const balance = await anticaptcha.getBalance();
    if (balance < 0) log.error('Your anti-captcha.com balance is below zero.');

    const taskId = await anticaptcha.createGeeTestTask();
    log.info('taskId: ' + taskId);

    const taskSolution = await anticaptcha.getTaskSolution(taskId);
    log.info('Solution received successfully.');

    await Apify.setValue('OUTPUT', taskSolution);
    log.info('Solution is saved to OUTPUT.');
    log.info(`Solution printed:
        ${JSON.stringify(taskSolution)}
    `);

    log.info('Task finished.');
});

//TOTH: 3
