const crypto = require('crypto');

module.exports = {
  devices: {
    pc: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
      viewport: {
        height: 1080,
        width: 1920,
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
        isLandscape: false
      }
    },
    mobile: {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
      viewport: {
        width: 375,
        height: 667,
        deviceScaleFactor: 1,
        isMobile: true,
        hasTouch: true,
        isLandscape: false
      }
    }
  },
  md5: (str) => {
    const md5 = crypto.createHash('md5');
    return md5.update(str, 'binary').digest('hex');
  }
};