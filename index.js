require('dotenv').load();

const rp = require('request-promise')
const cheerio = require('cheerio');
const CookieStore = require('tough-cookie-file-store');
const ora = require('ora');
const program = require('commander');
const inquirer = require('inquirer');
const mongoose = require('mongoose');

// AppConstants
const baseUrl = 'http://nadine.kemenkeu.go.id/';
const loginPath = '/simpleLogin.aspx';
const suratPath = '/surat_masuk/suratMasuk/detail.aspx?id=';

// Modules & Setup from eksternal files.
const parseHtml = require('./modules/parse-html');
const Surat = require('./modules/model-surat');
const db = mongoose.connect(process.env.MONGO_DB);
const jar = rp.jar(new CookieStore('./cookies.json'));
const nadineClient = rp.defaults({
  baseUrl,
  followRedirect: false,
  jar,
  simple: false,
  resolveWithFullResponse: true
})
const package = require('./package.json');

// Runtime variables
let username, password, startId, limit;


program
  .version(package.version)
  .description(package.description)
  .option('-u, --username', 'Username to be used.')
  .option('-p, --password', 'Password for the username.')
  .parse(process.argv)

if(program.username) username = program.username;
if(program.password) password = program.password;

checkSession();

function askCredential() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Username: '
    },
    {
      type: 'password',
      name: 'password',
      message: 'Password: '
    }
  ])
    .then((answer) => {
      username = answer.username;
      password = answer.password;
      loginNadine();
    })
}

function askSuratId() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'start',
      message: 'Start scrapping from id: '
    },
    {
      type: 'input',
      name: 'limit',
      message: 'Number of items: ',
      default: 100
    }
  ])
    .then((answer) => {
      startId = Number(answer.start);
      limit = Number(answer.limit);
      getSuratMasuk(startId, startId + limit);
    })
}

function saveSurat(surat) {
  spinner = ora('Saving to database...').start();
  Surat.create(surat)
    .then((val) => {
      spinner.succeed('Item saved. Id:' + val.id)
    })
    .catch((err) => {
      spinner.fail('Saving database failed.')
      console.error(err.message);
    })
}

function checkSession() {
  const spinner = ora('Checking session...').start();
  nadineClient({
    method: 'GET',
    uri: '/'
  })
    .then((response) => {
      if(response.statusCode == 302) {
        spinner.warn('Not authenticated.');
        askCredential();
      } else {
        spinner.succeed('Authenticated.');
        askSuratId();
      }
    })
    .catch((err) => {
      spinner.fail('Error on checking session.');
      console.error(err.message);
    })
}

function loginNadine() {
  const spinner = ora('Trying to login...').start();
  return nadineClient({
    method: 'POST',
    uri: loginPath,
    form: {
      MLoginForm: {
        username,
        password
      }
    }
  })
    .then((response) => {
      if(response.statusCode == 302) {
        spinner.succeed('Login success.');
        askSuratId();
      } else {
        spinner.warn('Login failed.');
      }
    })
    .catch((err) => {
      spinner.fail('Error on login.');
      console.error(err.message);
    })
}

function getSuratMasuk(id, max) {
  if(id >= max) {
    mongoose.connection.close();
    return;
  }
  else {
    const spinner = ora('Get surat id:'+id).start();
    nadineClient({
      method: 'GET',
      uri: suratPath + id,
      transform: body => cheerio.load(body),
      resolveWithFullResponse: false
    })
      .then(($) => {
        spinner.succeed('Surat id:'+id+' selesai.')
        saveSurat(parseHtml(id, $));
        getSuratMasuk(id + 1, max);
      })
  }
}

function logResponse(response) {
  console.log('Status : ', response.statusCode);
  console.log('Headers : ', response.headers);
  console.log('Body : ', response.body);
}