const puppeteer = require('puppeteer');
const mkdirp = require('mkdirp')

const mkdirpPromise = dir => {
  return new Promise((resolve, reject) => {
    mkdirp(dir, err => {
      if(err) reject(err)
      else resolve()
    })
  })
}

const hosts = {
  localhostProxy: 'http://localhost:8001/api/v1/namespaces/kube-system/services/http:kubernetes-dashboard:/proxy',
  inAPod: 'http://kubernetes-dashboard.kube-system:80'
}

const defaultVars = {
  host: hosts.inAPod,
  path: '/#!/overview?namespace=_all',
  dashboardVer: 'v1.8.1',
  viewport: {width: 900, height: 700}
}

const prefixPath ='k8s-screenshots'

const predefinedRecipes = {
  'v1.8.1': {
    workloads: {
      selector: 'kd-chrome md-content kd-content-card div.kd-content-card',
      domIndex: 2,
      imagePath: 'workloads.png'
    }
  }
}

const defaultRecipe = predefinedRecipes[defaultVars.dashboardVer].workloads

async function performScreenshot(page, recipe) {
  const { url, selector, domIndex, imagePath, viewport = defaultVars.viewport } = recipe

  await page.goto(url, {waitUntil: 'networkidle0'})

  page.setViewport(viewport)
  const elements = await page.$$(selector)
  const ele = elements[domIndex]

  const path = `${prefixPath}/${imagePath}`

  await mkdirpPromise(prefixPath)

  await ele.screenshot({ path })

  return path
}

async function screenshots({
  recipes = [defaultRecipe],
  options = {}
} = {
  recipes: [defaultRecipe],
  options: {
    host: defaultVars.host
  }
}) {
  const { host = defaultVars.host } = options
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  const paths = await Promise.all(recipes.map((rawRecipe) => {
    const recipe = {
      ...rawRecipe,
      url: `${host}${defaultVars.path}`,
    }

    return performScreenshot(page, recipe)
  }))

  await browser.close()

  return paths
}

async function screenshot({
  recipe = defaultRecipe,
  options = {}
} = {
  recipe: defaultRecipe,
  options: {
    filename: undefined,
    host: defaultVars.host
  }
}) {
  const { filename, host = defaultVars.host } = options

  const rec = { ...recipe, imagePath: filename || recipe.imagePath }
  const recipes = [rec]
  const paths = await screenshots({ recipes, options: { host } })

  return paths[0]
}

module.exports = { screenshots, screenshot, predefinedRecipes, hosts }