import { $ } from 'bun'
import fs from 'fs/promises'
import path from 'path'

// Change CWD to src-tauri
process.chdir(path.join(__dirname, '../desktop/src-tauri'))
const cwd = process.cwd()

const password = process.argv[2]
if (!password) {
	console.error('Please pass password')
	process.exit(1)
}
const keyParent = path.join(cwd, '../.tauri')
const keyPath = path.join(keyParent, 'upload-keystore.jks')
const propertiesPath = path.join(cwd, 'gen/android/key.properties')

if (!(await fs.exists(keyParent))) {
	await fs.mkdir(keyParent)
}

// Create key
if (!(await fs.exists(keyPath))) {
	console.info('Creating key')
	console.log(
		`keytool -genkey -noprompt -v -keystore ${keyPath} -keypass ${password} -storepass ${password} -keyalg RSA -keysize 2048 -validity 10000 -alias upload -dname "CN=mqttserver.ibm.com, OU=ID, O=IBM, L=Hursley, S=Hants, C=GB"`
	)

	await $`keytool -genkey -noprompt -v -keystore ${keyPath} -keypass ${password} -storepass ${password} -keyalg RSA -keysize 2048 -validity 10000 -alias upload -dname "CN=mqttserver.ibm.com, OU=ID, O=IBM, L=Hursley, S=Hants, C=GB"`
}

const content = [`storePassword=${password}`, `keyPassword=${password}`, `keyAlias=upload`, `storeFile=${keyPath}`].join('\n')
await fs.writeFile(propertiesPath, content)

console.log(`Created key in ${keyPath}`)
console.log(`Created properties in ${propertiesPath}`)
console.log('Now follow https://next--tauri.netlify.app/next/guides/distribution/sign-android/')
console.log('And then')
console.log('bunx tauri android build')

console.info('Btw maybe you will need')
console.info('import java.util.Properties')
console.info('import java.io.FileInputStream')
