const http = require('http');
const { parse: parseUrl } = require('url');

const deviceCnt = 50;

const devices = ['-ALLE-', '-ZENTRALE-'];
for (let i = 0; i < deviceCnt; i++) {
  devices.push('QEQ' + (Math.round(Math.random() * 10000000).toString() + '0000000').slice(0, 7));
}

const typs = [
  'INFO',
  'CLIMATECTRL_EVENT',
  'RESPONSE',
  'SENSOR_DATA',
  'POWER_EVENT',
  'ACTION',
];

const flags = ['WKUP', 'WKMEUP', 'BCAST', 'BURST', 'BIDI', 'RPTED', 'RPTEN'];

let lognumber = 0;

function genTelegram() {
  lognumber++;
  return {
    "tstamp": Math.round(Date.now() / 1000),
    "lognumber": lognumber,
    "rssi": -1 * Math.round(Math.random() * 120) - 20,
    "from": devices[Math.floor(Math.random() * devices.length)],
    "to": devices[Math.floor(Math.random() * devices.length)],
    "len": Math.round(Math.random() * 100),
    "cnt": Math.round(Math.random() * 100),
    "typ": typs[Math.floor(Math.random() * typs.length)],
    "flags": flags.sort(() => Math.random() - 0.5).slice(Math.floor(Math.random()*3 +1)).join(' ')
  }
}

let data = [];

for (let i = 0; i < 150; i++) {
  data.unshift(genTelegram());
}

setInterval(() => {
  const cnt = Math.random() * 10;
  for (let i = 0; i < cnt; i++) {
    data.unshift(genTelegram());
  }
  data = data.slice(0, 200);
}, 5000);


const server = http.createServer(function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const url = parseUrl(req.url, true);
  {
    switch (url.pathname) {

      case '/getLogByLogNumber':
        const offset = url.query && url.query.lognum;
        res.write(JSON.stringify(
          data.filter(item => offset ? item.lognumber > offset : true),
          null, 2)
        ); //write a response
        res.end(); //end the response
        break;

      case '/getConfig':
        res.write(JSON.stringify({
            "staticip": "0.0.0.0",
            "staticnetmask": "0.0.0.0",
            "staticgateway": "0.0.0.0",
            "ccuip": "192.168.1.252",
            "svanalyzeinput": "Analyzer_Input",
            "svanalyzeoutput": "Analyzer_Output"
          }, null, 2)
        );
        res.end();
        break;

      case '/reboot':
      case '/rebootconfig':
        console.log('Simulate ESP reboot, closing listener');
        res.writeHead(200);
        res.end();
        setTimeout(() => server.close(),1000);
        setTimeout(() => server.listen(3000,() => console.log('Listener opened')),10*1000);
        break;

      case '/deletecsv':
      case '/index.html':
        res.write(':)');
        res.end();
        break;

      default:
        res.writeHead(404);
        res.write('Not found');
        res.end();
    }
  }
});

server.listen(3000, () => console.log("Server start at port 3000"));
