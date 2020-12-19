FROM node:14-buster

ENV NODE_ENV production
ENV TZ Asia/Tokyo
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV APP_ROOT /workspace

ARG PACKAGES='libxcb-dri3-0 ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils'
RUN apt update && apt-get install -y --no-install-recommends $PACKAGES \
  && curl https://s3-ap-northeast-1.amazonaws.com/storage.turai.work/google-chrome-stable_84.0.4147.89-1_amd64.deb > /tmp/chrome.deb \
  && dpkg -i /tmp/chrome.deb \
  && rm /tmp/chrome.deb \
  && curl https://s3-ap-northeast-1.amazonaws.com/storage.turai.work/fonts-pc.deb > /tmp/font.deb \
  && dpkg -i /tmp/font.deb \
  && rm /tmp/font.deb \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

WORKDIR $APP_ROOT

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

CMD [ "npm", "start" ]
