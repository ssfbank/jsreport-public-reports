/*!
 * Extension allows to share reports with non authenticated users by exposing single purpose access tokens.
 * 
 * Adapted from jsreport-public-templates and jsreport-reports by Asbjørn Lucassen (Sparebanken Sogn og Fjordane) 2018.
 * Original works jsreport-public-templates and jsreport-reports Copyright(c) 2018 Jan Blaha
 */

function routes (reporter) {
  const serveReport = async (user, req, res) => {
    const result = await reporter.documentStore.collection('reports').find({_id: req.query.reportid}, req)
    if (result.length !== 1) {
      throw reporter.createError(`Report ${req.query.reportid} not found`, {
        statusCode: 404
      })
    }

    if (!result[0].readPermissions || !result[0].readPermissions.find((permission) => permission === user._id)) {
      throw reporter.createError(`Report ${req.query.reportid} not accessible`, {
        statusCode: 404
      })
    }

    const stream = await reporter.blobStorage.read(result[0].blobName)
    stream.on('error', function (err) {
      res.error(err)
    })

    if (result[0].contentType) {
      res.setHeader('Content-Type', result[0].contentType)
    }

    const filedate = new Date();
    const month = filedate.getMonth() + 1;
    let filename = 'report-' + req.query.reportid.substring(0,5) + '-' +  filedate.getFullYear() + month + filedate.getDate();
    if (result[0].fileExtension) {
      res.setHeader('File-Extension', result[0].fileExtension);
      filename = filename + '.' + result[0].fileExtension.replace('.');
    }
    res.setHeader('Content-Disposition', 'inline; filename="' + filename + '"');

    const buffer = stream.read();

    res.setHeader('Content-Length', buffer.length);

    return buffer;
  }

  return (app) => {

    app.get('/public-reports', async (req, res, next) => {
      const user = await reporter.documentStore.collection('users').findOne({ username: req.query.access_token});
      if (!user) {
        return res.status(401).end();
      }
      serveReport(user, req, res).then((buffer) => res.send(buffer)).catch(next)
    })

    app.get('/public-reports/:reportId', async (req, res, next) => {
      const isCsv = req.params.reportId.indexOf('.csv') >= 0;
      req.query.reportid = req.params.reportId.replace('.pdf', '').replace('.xlsx', '').replace('.csv', '');

      const user = await reporter.documentStore.collection('users').findOne({ username: req.query.access_token });
      if (!user) {
        return res.status(401).end();
      }

      serveReport(user, req, res)
        .then((buffer) => {
          res.send('\uFEFF' + buffer)
        })
        .catch(next)
    })
  }
}

module.exports = (reporter, definition) => {
  if (!reporter.documentStore.model.entityTypes.TemplateType || !reporter.authentication || !reporter.authorization) {
    definition.options.enabled = false
    return
  }

  reporter.on('express-configure', routes(reporter))
  reporter.initializeListeners.add('public-reports', () => reporter.emit('export-public-route', '/public-reports'))
}
