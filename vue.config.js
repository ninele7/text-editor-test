module.exports = {
  devServer: {
    hot: false,
    liveReload: true
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        win: {
          target: 'portable'
        }
      }
    }
  }
}
