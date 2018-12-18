# fis3 静态资源部署阿里云oss

fis 部署阿里云存储插件，提供静态资源快速部署, CDN加速。

## 安装

全局安装或者本地安装都可以。

```
npm install fis3-deploy-alibaba-oss or npm install fis3-deploy-alibaba-oss -g
```

## 使用方法

使用fis deploy 插件配置

```js
fis.match('*.js', {
    deploy: fis.plugin('alibaba-oss', {
        accessKeyId: '',  //ak
        accessKeySecret: '',  //sk
        bucket: '',
        region: '', // 默认 oss-cn-beijing
        domain: '' // 默认显示为oss上传成功的url
    })
})
```
