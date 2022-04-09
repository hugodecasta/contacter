const fs = require('fs')
const rimraf = require('rimraf')
const fse = require('fs-extra')

const from_dir = __dirname
const art_dir = __dirname + '/artifact'
if (fs.existsSync(art_dir)) rimraf.sync(art_dir)

fs.mkdirSync(art_dir)

const excluder = ['.github', '.git', '.env']
const files = fs.readdirSync(from_dir).filter(f => f.includes('.')).filter(f => !excluder.includes(f))
files.forEach(f => fs.copyFileSync(from_dir + '/' + f, art_dir + '/' + f))

const dirs = ['method_engines']
dirs.forEach(d => fse.copySync(from_dir + '/' + d, art_dir + '/' + d))