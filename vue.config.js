const path = require('path')
const HtmlWebpackExcludeEmptyAssetsPlugin = require('html-webpack-exclude-empty-assets-plugin');

function resolve (dir) {
    return path.join(__dirname, dir)
}

class CssListPlugin {
    apply(compiler) {
        compiler.hooks.emit.tapAsync('CssListPlugin', (compilation, callback) => {
            let cssFiles = [];
            let content = '';

            // 遍历所有编译过的资源文件，
            for (let filename in compilation.assets) {
                if(/^css\/\S+\.\S+\.css$/.test(filename)){
                    cssFiles.push(filename);
                    content += compilation.assets[filename].source();
                }
            }

            content = `/*\n${cssFiles.join('\n')}\n*/${content}`;

            // 将这个列表作为一个新的文件资源，插入到 webpack 构建中：
            compilation.assets['/static/css/all.css'] = {
                source() {
                    return content;
                },
                size() {
                    return content.length;
                }
            };

            callback();
        });
    }
}

function resolve (dir) {
    return path.join(__dirname, '..', dir)
}

module.exports = {
    runtimeCompiler: true,
    /*
    * transpileDependencies的工作方式官方文档没说清楚，详见源码：
    * https://github.com/vuejs/vue-cli/blob/47a28e0e245894db91457ad52b1fce7dcc798a3f/packages/%40vue/cli-plugin-babel/index.js
    * https://cli.vuejs.org/zh/guide/browser-compatibility.html#usebuiltins-usage
    * */
    transpileDependencies: ['@zlx/be-ui', 'element-ui/src/mixins/emitter'],
    productionSourceMap: false,
    devServer: {
        proxy: {
            '/service/mock': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                pathRewrite: {
                    '^/service/mock': ''
                },
            },
            '/service': {
                target: 'http://admin.zailouxia.com',
                changeOrigin: true,
                pathRewrite: {
                    '^/service': '/service'
                }
            },
            
            '/static': {
                target: 'http://admin.zailouxia.com',
                changeOrigin: true,
                pathRewrite: {
                    '^/static': '/static'
                }
            }
        }
    },
    chainWebpack: config => {
        //去掉prefetch和preload
        config.plugins.delete('prefetch');
        config.plugins.delete('preload');
        config.module
            .rule('html')
            .test(/\.html$/)
            .use()
            .loader('html-loader')

        config.module
            .rule('images')
            .use('url-loader')
            .tap(options => {
                options.limit = 10240;
                return options;
            })
    },
    configureWebpack: {
        optimization: {
            removeEmptyChunks: true
        },
        plugins: [
            new CssListPlugin(),
            new HtmlWebpackExcludeEmptyAssetsPlugin()
        ],
        resolve: {
            alias: {
                '@images': resolve('src/assets/images'),
            },
            extensions: [
                '.wasm',
                '.mjs',
                '.js',
                '.jsx',
                '.vue',
                '.json',
                '.html',
            ]
        }
    }
}
