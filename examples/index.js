const { screenshot, screenshots, predefinedRecipes, hosts: { localhostProxy } } = require('k8s-dashboard-screenshot');

(async () => {
  const insideAPod = await screenshot()

  const customFilename = await screenshot({
    options: {
      filename: 'custom-filename.png'
    }
  })

  const customRecipe = await screenshot({
    recipe: predefinedRecipes['v1.8.1'].workloads,
  })

  const customHost = await screenshots({
    options: {
      host: localhostProxy
    }
  })

  console.log(simple, customFilename, customRecipe, customHost)
})();
