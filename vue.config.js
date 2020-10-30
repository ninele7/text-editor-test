module.exports = {
  devServer: {
    hot: false,
    liveReload: true
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        win: {
          target: 'portable'
        }
      }
    }
  }
}
