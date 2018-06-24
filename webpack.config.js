const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 用于在构建前清除dist目录中的内容
const CleanWebpackPlugin = require('clean-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');//css样式从js文件中分离

module.exports = {
    /**
     * 三种方式
     * 1、entry: "xxxxx"  一个模块直接引入，可以是js文件，可以是scss文件
     * 2、entry: ["zzz", "yyy", "xxx"]   一个数组引入多个模块，若有相互依赖先后关系，则需要调整顺序，
     *     如下则是，GalleryByReactApp.js需要main.scss，那么就需要main.scss先导入
     *     entry: [__dirname + "/src/styles/main.scss", __dirname + "/src/components/GalleryByReactApp.js"]
     * 3、entry: {key1: value1,  key2: value2}   value可以是数组
     *    注意：这种情况，必须在output中的filename必须为[name]或其类似：filename: "[name].js"  不然报错：Conflict: Multiple assets emit to the same filename bundle.js
     *    [name]： key
     *    [hash]： 打包版本的hash
     *    [chunkhash]： 每个文件的hash，与打包版本的hash不一样，而且，只有改动的文件，hash才会改变，否则不会改变
     *    以上三个参数，或者是[name]-[hash]
     */
    entry:{
        scss: __dirname + "/src/styles/main.scss",
        js: __dirname + "/src/components/GalleryByReactApp.js",
        // 测试将不同的模块生成到不同的HTML中
        a: __dirname + "/src/components/a.js",
        b: __dirname + "/src/components/b.js",
        c: __dirname + "/src/components/c.js",
    },
    /**
     * 1、调整输出路径，把index.html文件放在dist路径下
     * 2、把js文件放到dist/js目录下
     */
    output: {
        // path-输出的内容都放在path目录下
        path: __dirname + "/dist",
        filename: "js/[name]-[hash].js",
        // 在发布的时候，绝对路径都被替换成以'http://zzl.com/'开头的路径-参考打包后的js文件：
        // http://zzl.com/js/scss-dd5d834063f4315da997.js
        // 若此处设置其他的随机值，则在本地运行会出错
        publicPath: "http://localhost:8080/"
    },
    devtool: 'eval-source-map',
    devServer: {
        contentBase: "./dist",//本地服务器所加载的页面所在的目录
        historyApiFallback: true,//不跳转
        inline: true,
        hot: true
    },
    module: {
        rules: [
            {
                test: /(\.jsx|\.js)$/,
                use: {
                    loader: "babel-loader"
                },
                exclude: /node_modules/
            },
            {
                // test 表示测试什么文件类型
                test:/\.css$/,
                // 使用 'style-loader','css-loader'
                use:ExtractTextPlugin.extract({
                    fallback:'style-loader', // 回滚
                    use:[
                        {loader:'css-loader'},
                        {loader:'postcss-loader'} //利用postcss-loader自动添加css前缀
                    ],
                    publicPath:'../' //解决css背景图的路径问题
                })
            },
            {
                test:/\.(sass|scss)$/,
                use:['style-loader','css-loader','postcss-loader', 'sass-loader']
            },
            {
                test: /\.(png|jpg|woff|woff2|jpeg)$/,
                use:[
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin("style.css"), //提取出来的样式放在style.css文件中
        new webpack.BannerPlugin('版权所有，翻版必究'),
        /**
         * 1、new 一个这个插件的实例，并传入相关的参数,此处的HtmlWebpackPlugin是在开头定义的
         * 2、此处会把输出的js文件，自动添加到index.html中
         */
        new HtmlWebpackPlugin({
            //生成指定名称的html文件,可以理解为，默认生成的是index.html
            // filename: index-[hash].html
            template: __dirname + "/src/index.tmpl.html",
            // 把生成的脚本生成到 head标签中,默认的是在body中
            inject: 'body',
            // 定义一个值，从html中取值
            myTitle: 'Test My Title',
            // 除了哪些chunk其余的都被打包进来，跟下面的chunks相反
            excludeChunks: ['a', 'b', 'c']
            // 压缩生成的html文件
            /*minify: {
                // 删除注释
                removeComments: true,
                // 删除空格
                collapseWhitespace: true
            }*/
        }),
        // 如下三个，分别针对三个不同的chunk生成不同的html文件，每个HTML中的js文件不一致。使用chunks属性来控制
        new HtmlWebpackPlugin({
            filename: 'a.html',
            template: __dirname + "/src/index.tmpl.html",
            myTitle: 'Test My Title a',
            chunks: ['a']
        }),
        new HtmlWebpackPlugin({
            filename: 'b.html',
            template: __dirname + "/src/index.tmpl.html",
            myTitle: 'Test My Title b',
            chunks: ['b']
        }),
        new HtmlWebpackPlugin({
            filename: 'c.html',
            template: __dirname + "/src/index.tmpl.html",
            myTitle: 'Test My Title c',
            chunks: ['c']
        }),
        new ExtractTextPlugin('build/index.css'), //都提到dist目录下的css目录中,文件名是index.css里面
        new webpack.HotModuleReplacementPlugin(),//热加载插件
        // 清除dist构建目录文件
        new CleanWebpackPlugin(__dirname + "/dist")
    ],
};
