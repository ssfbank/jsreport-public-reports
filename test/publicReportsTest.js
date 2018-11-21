process.env.debug = 'jsreport'
const supertest = require('supertest')
const jsreport = require('jsreport-core')
require('should')

const authOptions = {
  'cookieSession': {
    'secret': 'dasd321as56d1sd5s61vdv32'
  },
  'admin': {
    'username': 'admin',
    'password': 'password'
  }
}

describe('public-reports', () => {
  let reporter

  beforeEach(() => {
    reporter = jsreport({
      extensions: {
        authentication: authOptions
      }
    })

    reporter.use(require('..')())
    reporter.use(require('jsreport-templates')())
    reporter.use(require('jsreport-express')())
    reporter.use(require('jsreport-authentication')())
    reporter.use(require('jsreport-authorization')())

    return reporter.init()
  })

  afterEach(() => reporter.close())

  it('/public-reports?access_token=xxx&reportid=bar should return 401 on wrong', async () => {
    return supertest(reporter.express.app)
      .get('/public-reports?access_token=foo&reportid=bar')
      .expect(401)
  })
})
