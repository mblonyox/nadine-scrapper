const rp = require('request-promise')
const CookieStore = require('tough-cookie-file-store');
const ora = require('ora');
const program = require('commander');
const inquirer = require('inquirer');

const baseUrl = 'http://nadine.kemenkeu.go.id/';
const loginPath = '/simpleLogin.aspx';
const suratPath = '/surat_masuk/suratMasuk/detail.aspx?id=';
const jar = rp.jar(new CookieStore('./cookies.json'));
const nadineClient = rp.defaults({
  baseUrl,
  followRedirect: false,
  jar,
  simple: false,
  resolveWithFullResponse: true
})
const package = require('./package.json');

let username, password;


program
  .version(package.version)
  .description(package.description)
  .option('-u, --username', 'Username to be used.')
  .option('-p, --password', 'Password for the username.')
  .parse(process.argv)

if(program.username) username = program.username;
if(program.password) password = program.password;

checkSession();

async function askCredential() {
  return await inquirer.prompt([
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

async function checkSession() {
  const spinner = ora('Checking session...').start();
  return await nadineClient({
    method: 'GET',
    uri: '/',
    headers: {
      'Referer': baseUrl
    }
  })
    .then((response) => {
      if(response.statusCode == 302) {
        spinner.warn('Not authenticated.');
        askCredential();
      } else {
        spinner.succeed('Authenticated.');
        getSuratMasuk();
      }
    })
    .catch((err) => {
      spinner.fail('Error on checking session.');
      console.error(err.message);
    })
}

async function loginNadine() {
  const spinner = ora('Trying to login...').start();
  return await nadineClient({
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
        getSuratMasuk();
      } else {
        spinner.warn('Login failed.');
      }
    })
    .catch((err) => {
      spinner.fail('Error on login.');
      console.error(err.message);
    })
}

async function getSuratMasuk(id) {
  return await nadineClient({
    method: 'GET',
    uri: suratPath + id
  })
}

function logResponse(response) {
  console.log('Status : ', response.statusCode);
  console.log('Headers : ', response.headers);
  console.log('Body : ', response.body);
}