module.exports = async ({ inputs, core, glob, fetch, require, FormData, fileFrom }) => {
  const fs = require('fs')
  const path = require('path')

  const auth = `X-ApiKey ${inputs.hackageToken}`
  const uploadUrlSuffix = inputs.candidate ? '/candidates' : '/upload'
  const packageUrlSuffix = inputs.candidate ? '/candidate' : ''
  const checkExists = !inputs.candidate

  const archivePaths = await glob.create(`${inputs.packagesPath}/*.tar.gz`).then((g) => g.glob())
  for (const archivePath of archivePaths) {
    const name = path.basename(archivePath, '.tar.gz')
    const uploadUrl = `${inputs.hackageServer}/packages${uploadUrlSuffix}`
    const packageUrl = `${inputs.hackageServer}/packages/${name}${packageUrlSuffix}`

    // check if package already uploaded
    if (checkExists) {
      const existsResp = await fetch(packageUrl, { method: 'HEAD' })
      if (existsResp.status != 404) {
        core.info(`Package "${name}" already exists on Hackage`)
        continue
      }
    }

    // upload package
    core.info(`Uploading package "${name}" to ${uploadUrl}`)
    const uploadBody = new FormData()
    const archiveFile = await fileFrom(archivePath, 'application/octet-stream')
    uploadBody.set('package', archiveFile)
    const uploadResp = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Authorization': auth },
      body: uploadBody,
    })
    if (uploadResp.status >= 400) {
      const uploadRespBody = await uploadResp.text()
      throw new Error(`Failed to upload package "${name}": ${uploadRespBody}`)
    }
    core.info(`Successfully uploaded ${packageUrl}`)

    // upload docs
    const docsArchive = `${inputs.docsPath}/${name}-docs.tar.gz`
    const docsUrl = `${packageUrl}/docs`
    if (inputs.docsPath && fs.existsSync(docsArchive)) {
      core.info(`Uploading documentation for "${name}" to ${docsUrl}`)
      const docsBody = await fetch.blobFrom(docsArchive, 'application/octet-stream')
      await fetch(docsUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-tar',
          'Content-Encoding': 'gzip',
          'Authorization': auth,
        },
        body: docsBody,
      })
      core.info(`Successfully uploaded ${docsUrl}`)
    }
  }
}
