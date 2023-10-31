// https://leetcode.com/accounts/login/
import puppeteer from 'puppeteer'

import 'dotenv/config'

const { EMAIL, PASSWORD, USERNAME } = process.env
function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  })
}

async function go({ progressCb = () => {}, targetUser }) {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()
  // request intercept
  await page.setRequestInterception(true)
  page.on('request', async (request) => {
    request.continue()
  })

  page.on('response', async (response) => {
    const request = response.request()
    if (request.url().endsWith('/graphql/')) {
      const json = await response.json()
      try {
        const postData = JSON.parse(request.postData())
        const { operationName } = postData
        console.log(operationName, json)
      } catch (e) {
        console.error(e)
      }
    }
  })

  await page.goto('https://leetcode.com/accounts/login/')
  await page.setViewport({ width: 800, height: 600 })

  await page.waitForSelector('input[id="id_login"]')
  await page.type('input[id="id_login"]', EMAIL)
  await page.type('input[id="id_password"]', PASSWORD)
  await delay(2300)
  await page.click('button[id="signin_btn"')
  await page.waitForSelector('#navbar_user_avatar')
  progressCb({ data: 'log in successfully', type: 'info' })
  await page.goto(`https://leetcode.com/${targetUser}/`)
  // leetcode query timestamp regularly, so this won't work
  // await page.waitForNetworkIdle({ idleTime: 2000, timeout: 15000 })
  await browser.close()
}
function progressCb(payload) {
  console.log(payload)
}
go({ progressCb, targetUser: 'wwwap', overrides: { recentACLimit: 20 } })
