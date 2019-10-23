import Vue from 'vue';
// 公共组件引入方式 规则、组件名称已文件名首字母大写全拼
function changeStr(str){
    return str.charAt(0).toUpperCase()+str.slice(1);
}
const requireComment=require.context('./components',true,/\.vue$/);
requireComment.keys().forEach((fileName)=>{
    const config=requireComment(fileName)
    const componentName=changeStr(
        fileName.replace(/^\.\//,'').replace(/\.\w+$/,'')
    )
    Vue.component(componentName,config.default||config)
})
