const puppeteer = require('puppeteer')
const utils = require('./util')
const path = require('path')
const moment = require('moment')
const fs = require('fs').promises

const SAVE_DIR = 'pdfs/'

module.exports = class Capture {
  constructor(options) {
    this.options = options
    this.page
    this.browser
    this.info = {}
    this.info.messages = []
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
    ]
    const options = {
      args: args,
      ignoreHTTPSErrors: true,
      ignoreDefaultArgs: ['--enable-automation'],
      // headless: false
    }
    if(await utils.fileExists('/opt/google/chrome/chrome')) {
      options.executablePath = '/opt/google/chrome/chrome'
    }
    this.browser = await puppeteer.launch(options)
    this.page = await this.browser.newPage()
    await this.page.emulateMediaType('screen')
    await this.page.emulate(this.device)
    await this.page.setDefaultNavigationTimeout(15 * 1000)
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'ja'
    })
    // geolocationを有効化
    const context = this.browser.defaultBrowserContext()
    await context.overridePermissions(this.URL, ['geolocation'])
    // 現在位置を東京駅にセット
    const client = await this.page.target().createCDPSession()
    await client.send('Emulation.setGeolocationOverride', {
      latitude: 35.681236,
      longitude: 139.767125,
      accuracy: 100
    })
    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'language', {
        get: function() {
          return ['ja-JP']
        }
      })
      Object.defineProperty(navigator, 'languages', {
        get: function() {
          return ['ja-JP', 'ja']
        }
      })
    })
  }

  get device() {
    return utils.devices[this.device_type]
  }

  get device_type() {
    return this.options.device ? this.options.device : 'pc'
  }

  async goto() {
    try {
      await this.page.goto(this.URL, {waitUntil: 'networkidle2'})
    } catch (error) {
      if( error instanceof puppeteer.errors.TimeoutError) {
        this.info.messages.push('timeout')
      } else {
        throw error
      }
    }
    const per_scoll_px = 700
    const height = await this.getPageHeight()
    const scoll_count = Math.ceil(height / per_scoll_px)

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
    )
    await this.page.evaluate(() => window.scrollTo(0,0))
    await this.page.waitForTimeout(1000)
  }

  async getPageHeight() {
    return await this.page.evaluate(
      `Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
      );`
    )
  }
  
  async getPageWidth() {
    return await this.page.evaluate(
      `Math.max(
        document.body.scrollWidth, document.documentElement.scrollWidth,
        document.body.offsetWidth, document.documentElement.offsetWidth,
        document.body.clientWidth, document.documentElement.clientWidth
      );`
    )
  }


  async save(fileSave = false) {
    const filepath = (fileSave) ? this.pdfPath : null
    if(filepath) {
      const dirpath = path.dirname(filepath)
      await fs.mkdir(dirpath, { recursive: true })
    }
    return await this.page.pdf({
      path: filepath,
      width: await this.getPageWidth(),
      height: await this.getPageHeight(),
      printBackground: true,
      pageRanges: '1'
    })
  }

  async close() {
    await this.browser.close()
  }

  get URL() {
    return this.options.url
    // const u = new URL(this.options.url);
    // u.searchParams.delete('utm_source');
    // u.searchParams.delete('utm_medium');
    // u.searchParams.delete('utm_campaign');
    // return u.toString();
  }

  get pdfPath() {
    const hash = utils.md5(this.URL)
    const filename = `${this.device_type}_${hash}.pdf`
    return path.join(SAVE_DIR, moment().format('YYYYMMDD'), filename)
  }

  async response() {
    return {
      url: this.URL,
      device_type: this.device_type,
      title: await this.page.title() || 'unknown',
      filepath: this.pdfPath,
      messages: this.info.messages.join('|')
    }
  }

}

