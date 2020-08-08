module.exports={
    configureWebpack:{
        resolve:{
            alias:{
                'assets':'@/assets',
                'components':'@/components',
                'views':'@/views',
                'common':'@/common',
                'network':'@/network'
            }
        }
    },
    publicPath:process.env.NODE_ENV === 'production'
    ? '/'
    : '/',
    // outputDir:__dirname+'/../server/web',
}