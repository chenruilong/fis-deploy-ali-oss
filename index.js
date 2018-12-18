const OSS = require('ali-oss')

// 初始化 oss client
async function initOSS(options) {
	options.region = options.region || 'oss-cn-beijing'

	const client = new OSS({
		accessKeyId: options.accessKeyId,
		accessKeySecret: options.accessKeySecret,
		bucket: options.bucket,
		region: options.region
	})

	client.showDomain = fixDomain(options.domain)
	return client
}

function fixDomain (domain = '') {
	if (!domain) return
	const reg = /\/+$/
	if (reg.test(domain)) {
		return `${domain.replace(reg, '/')}`
	} else {
		return `${domain}/`
	}
}

// 提取file name 和 content
async function preUpload(modified) {
	let files = []
	modified.map(file => {
		const fileName = file.getHashRelease().replace(/^\//, '')
		const bufferContent = new Buffer(file.getContent())
		const subpath = file.subpath.replace(/^\//, '')
		files.push({
			subpath,
			name: fileName,
			content: bufferContent
		})
	})

	return files
}

// upload
async function upload(client, files = [], next) {
	if (!client) {
		throw new Error('oss client not found!!')
	}

	if (files.length <= 0) {
		process.stdout.write(`\n${`upload-oss bucket >> ${client.options.bucket || ''}`.green.bold} [${fis.log.now(true)}] 上传完成！`)
		typeof next === 'function' && next()
		return false
	}

	const file = files.shift()

	try {
		const res = await client.put(file.name, file.content)
		let url = client.showDomain ? `${client.showDomain}${res.name}`: res.url
		process.stdout.write(`\n${`upload-oss bucket >> ${client.options.bucket || ''}`.green.bold} [${fis.log.now(true)}] ${file.subpath} ${`>>`.yellow.bold} ${url}`)
	} catch (e) {
		throw new Error(e)
	}

	upload(client, files, next)
}
/**
 * deploy-qiniu 插件接口
 * @param  {Object}   options  插件配置
 * @param  {Object}   modified 修改了的文件列表（对应watch功能）
 * @param  {Object}   total    所有文件列表
 * @param  {Function} next     调用下一个插件
 * @return {undefined}
 */
module.exports = async (options, modified, total, next) => {
	if (!options.accessKeyId || !options.accessKeySecret) {
		throw new Error('options.accessKeyId and options.accessKeySecret is required!');
	} else if (!options.bucket) {
		throw new Error('options.bucket is required!');
	}

	const client = await initOSS(options)
	const files = await preUpload(modified)

	upload(client, files, next)
}
