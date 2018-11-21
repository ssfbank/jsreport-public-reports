
# jsreport-public-reports

Extension allows to share reports with non authenticated users by exposing single purpose access tokens.

## Installation
> npm install jsreport-public-reports

## jsreport-core
You can apply this extension also manually to [jsreport-core](https://github.com/jsreport/jsreport-core)

```js
var jsreport = require('jsreport-core')()
jsreport.use(require('jsreport-public-reports')())
```

## Dependencies and setup

This depends on jsreport authentication, authorization, reports and blobstorage. This is untested on other blobs than in memory, but may work. The reason for this implicit dependency is to get content-length for the pdf stream.
In the render requests you need to flag the request to save the report. See central jsreport report documentation.

## Usage

    /public-reports?access_token=jsreport_user_username&reportid=aYue6aCjHapVoDmq

Where access token is a js report username with read rights on the report resource.

This security model should be flexible for various use cases, but the primary use is that the jsreport client(usually the webserver) should generate a secure token and create a one-time user with readrights on one specific report.

## Legal

Adapted from jsreport-public-templates and jsreport-reports by Asbjørn Lucassen (Sparebanken Sogn og Fjordane) 2018.
Original works [jsreport-core](https://github.com/jsreport/jsreport-public-templates) and [jsreport-reports](https://github.com/jsreport/jsreport-reports) Copyright(c) 2018 Jan Blaha
