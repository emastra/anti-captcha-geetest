# Actor anti-captcha-geetest

Anti-captcha-geetest is an actor for solving Geetest captchas using the anti-captcha.com service. You need to have an anti-captcha subscription to be able to use it.
More info at [anti-captcha.com](https://anti-captcha.com/mainpage).

- [Input](#input)
- [Call it](#call-it)
- [Output](#output)
- [Open an issue](#open-an-issue)

### Input

| Field | Type | Description |
| ----- | ---- | ----------- |
| anticaptchaToken | string | (REQUIRED) your anti-captcha.com token |
| websiteURL | string | (REQUIRED) the target page URL |
| gt | string | (REQUIRED) gt key obtained from the target page HTML |
| challenge | string | (REQUIRED) challenge key obtained from the target page HTML |
| serverSubdomain | string | There are some custom implementations of GeeTest which use dedicated API subdomain. In this case simply specify this subdomain here. |
| userAgent | string | if needed, specify the userAgent here  |
| proxyType | string | if needed, proxy address protocol (http or https) |
| proxyIPAddress | string | IP address of the proxy server. To traslate doamin to IP you can use [node.js dns module](https://nodejs.org/api/dns.html) |
| proxyPort | string | proxy port |
| proxyLogin | string | proxy username, if needed |
| proxyPass | string | proxy password, if needed |

### Call it
To call this actor from your actor code:

```
const callInput = {
    anticaptchaToken,
    websiteURL,
    gt,
    challenge,
    serverSubdomain,
    userAgent,
    proxyType,
    proxyIPAddress,
    proxyPort,
    proxyLogin,
    proxyPass
}

const run = await Apify.call('emastra/anti-captcha-geetest', callInput);
console.log('Received result:', run.output.body);
```

### Output
The output will include the solution keys.
These solution keys must be sent to the target page through a http POST request.

### Open an issue
If you find any bug, please create an issue on the actor [Github page](https://github.com/emastra/anti-captcha-geetest).
