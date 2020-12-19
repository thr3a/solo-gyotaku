const puppeteer = require('puppeteer');
const utils = require('./util');
const path = require('path');
const moment = require('moment');

const SAVE_DIR = './pdfs/';

module.exports = class Capture {
  constructor(options) {
    this.options = options;
    this.page;
    this.browser;
    this.info = {};
    this.info.messages = [];
  }

  async openBrowser() {
    const args = [
      '--no-sandbox',
      `--window-size=${this.device.viewport.width},${this.device.viewport.height}`,
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--ignore-certificate-errors',
      '--lang=ja',
      '--disable-dev-shm-usage'
    ];
    this.browser = await puppeteer.launch({
      args: args,
      ignoreHTTPSErrors: true,
      ignoreDefaultArgs: ['--enable-automation'],
      // headless: false
    });
    this.page = await this.browser.newPage();
    await this.page.emulateMediaType('screen');
    await this.page.emulate(this.device);
    await this.page.setDefaultNavigationTimeout(15 * 1000);
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'ja'
    });
    // geolocationを有効化
    const context = this.browser.defaultBrowserContext();
    await context.overridePermissions(this.URL, ['geolocation']);
    // 現在位置を東京駅にセット
    const client = await this.page.target().createCDPSession();
    await client.send('Emulation.setGeolocationOverride', {
      latitude: 35.681236,
      longitude: 139.767125,
      accuracy: 100
    });
    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'language', {
        get: function() {
          return ['ja-JP'];
        }
      });
      Object.defineProperty(navigator, 'languages', {
        get: function() {
          return ['ja-JP', 'ja'];
        }
      });
    });
  }

  get device() {
    return utils.devices[this.device_type];
  }

  get device_type() {
    return this.options.device ? this.options.device : 'pc';
  }

  async goto() {
    try {
      await this.page.goto(this.URL, {waitUntil: 'networkidle2'});
    } catch (error) {
      if( error instanceof puppeteer.errors.TimeoutError) {
        this.info.messages.push('timeout');
      } else {
        throw error;
      }
    }
    const per_scoll_px = 700;
    const height = await this.getPageHeight();
    const scoll_count = Math.ceil(height / per_scoll_px);

    await this.page._client.send(
      'Input.synthesizeScrollGesture',
      {
        x: 0,
        y: 0,
        xDistance: 0,
        yDistance: per_scoll_px * -1,
        repeatCount: scoll_count,
        repeatDelayMs: 10,
        speed: 1200
      }
    );
    await this.page.evaluate(() => window.scrollTo(0,0));
    await this.page.waitForTimeout(1000);
    this.info.title = await this.page.title();
  }

  async getPageHeight() {
    return await this.page.evaluate(
      `Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
      );`
    );
  }
  
  async getPageWidth() {
    return await this.page.evaluate(
      `Math.max(
        document.body.scrollWidth, document.documentElement.scrollWidth,
        document.body.offsetWidth, document.documentElement.offsetWidth,
        document.body.clientWidth, document.documentElement.clientWidth
      );`
    );
  }


  async save() {
    await this.page.pdf({
      path: this.pdfPath,
      width: await this.getPageWidth(),
      height: await this.getPageHeight(),
      printBackground: true,
    });
  }

  async close() {
    try {
      await this.browser.close();
    } catch (error) {
      this.info.messages.push('failed close browser');
    }
  }

  get URL() {
    return this.options.url;
    // const u = new URL(this.options.url);
    // u.searchParams.delete('utm_source');
    // u.searchParams.delete('utm_medium');
    // u.searchParams.delete('utm_campaign');
    // return u.toString();
  }

  get pdfPath() {
    const hash = utils.md5(this.URL);
    const filename = `${moment().format('YYYYMMDD')}_${this.device_type}_${hash}.pdf`;
    return path.join(SAVE_DIR, filename);
  }

  response(status) {
    const res = {
      url: this.URL,
      width: this.info.pageWidth || 0,
      height: this.info.pageHeight || 0,
      device_type: this.device_type,
      status: status,
      title: this.info.title || 'unknown',
      filepath: this.pdfPath
    };
    return JSON.stringify(res);
  }

};

