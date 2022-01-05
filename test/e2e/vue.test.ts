import { resolve } from 'path'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { createServer } from 'vite'
import type { ViteDevServer } from 'vite'
import { Browser, chromium, Page } from 'playwright'

const vueRoot = resolve('./examples/vue')

describe('vue e2e test', async() => {
  let server: ViteDevServer
  let browser: Browser
  let page: Page

  beforeAll(async() => {
    server = await createServer({ 
      root: vueRoot,
      build: {
        target: 'esnext',
      }
    })
    await server.listen()
    browser = await chromium.launch()
    page = await browser.newPage()
  })

  afterAll(async() => {
    await browser.close()
    server.httpServer.close()
  })

  const getUrl = (path: string) => `http://localhost:${server.config.server.port}${path}`

  test('/blog/today should have currect content', async() => {
    try {
      await page.goto(getUrl('/blog/today'))
      let text = await page.$eval('body > div', (el) => el.textContent)
      expect(text.trim()).toBe('blog/today/index.vue')
    }
    catch (e) {
      console.error(e)
      expect(e).toBeUndefined()
    }
  })
  
  test('/blog/today/xxx should be nested cache all', async() => {
    try {
      await page.goto(getUrl('/blog/today/xxx'))
      let text = await page.$eval('body > div', (el) => el.textContent)
      expect(text.trim()).toBe('blog/today ...all route')
    }
    catch (e) {
      console.error(e)
      expect(e).toBeUndefined()
    }
  })

  test('/markdown should have markdown content', async() => {
    try {
      await page.goto(getUrl('/markdown'))
      let text = await page.$eval('body > div > div > h1', (el) => el.textContent)
      expect(text.trim()).toBe('hello from markdown file')
    }
    catch (e) {
      console.error(e)
      expect(e).toBeUndefined()
    }
  })

  test('/xxx/xxx should be cache all route', async() => {
    try {
      await page.goto(getUrl('/xxx/xxx'))
      let text = await page.$eval('body > div', (el) => el.textContent)
      expect(text.trim()).toBe('...all route')
    }
    catch (e) {
      console.error(e)
      expect(e).toBeUndefined()
    }
  })

  test('/about/1b234bk12b3/more deep nested dynamic route should works', async() => {
    try {
      await page.goto(getUrl('/about/1b234bk12b3/more'))
      let text = await page.$eval('div.deep-more', (el) => el.textContent)
      expect(text.trim()).toBe('deep nested: about/[id]/more.vue')
    }
    catch (e) {
      console.error(e)
      expect(e).toBeUndefined()
    }
  })

  test('/features/dashboard custom routes folder should works', async() => {
    try {
      await page.goto(getUrl('/features/dashboard'))
      let text = await page.$eval('body > div > p', (el) => el.textContent)
      expect(text.trim()).toBe('features/dashboard/pages/dashboard.vue')
    }
    catch (e) {
      console.error(e)
      expect(e).toBeUndefined()
    }
  })
})