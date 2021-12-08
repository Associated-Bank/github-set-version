const core = require('@actions/core');
const github = require('@actions/github');
const path = require("path");
const fs = require('fs');
const globby = require('globby');
const util = require('util');
const async = require("async");

const stringToRegExp = require('string-to-regexp');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const debug = (''+core.getInput('debug'))==="true";

let version = core.getInput('version') || process.env.version;
if(!version) version = "0";
version=version.replace(/v/g,'');
let rex = core.getInput('template') || '{repo}\\?ref=(v?[0.9]*\.[0.9]*\.[0.9]*)';
rex = rex.replace(/\{repo\}/g, github.context.repo.repo);
if(debug) console.log('replaceVersion: matching -',rex);
rex = stringToRegExp('/'+rex+'/g');

let inputFiles = (core.getInput('files') || '**/README.md').split(',');
let exclude = (core.getInput('exclude') || 'node_modules').split(',');
for(let i=0;i<exclude.length;i++) {
    inputFiles.push('!'+exclude[i]);
}

if(version==="0")  {
    console.log('version is required parameter')
    process.exit(1);
    return;
}

if(version.indexOf('-')>0) {
    version=version.split('-')[0];
}

(async () => {
    const files = await globby(inputFiles);

    if(debug) {
        console.log('setNetVersion: start');
        console.log('setNetVersion:',inputFiles);
        console.log('setNetVersion:',files);
    }

    if(files.length>0) {
        console.log("replaceVersion: ",version);

        for(let i=0;i<files.length;i++) {
            let filename = path.join(process.cwd(), files[i]);

            if(debug)
            console.log('replaceVersion: reading -', filename);

            let data = await readFile(filename, 'utf8');

            let matches = data.match(rex);
            if(!matches) continue;
            for(let j=0;j<matches.length;j++) {
                let replace = matches[j].replace(/=v?[0.9]*.[0.9]*.[0.9]*/g,(m)=>{
                    if(m.indexOf('.')>=0) return "="+(m.indexOf('v')>0?'v':'')+version;
                    return m;
                });
                data = data.replace(matches[j], replace);
            }

            if(!debug) await writeFile(filename, data);
            else console.log(data);
            console.log('replaceVersion: writing -', filename);
        }
        console.log('replaceVersion: done');

        process.exit(0);
    } else {
        console.log("replaceVersion: no README.md file found");
        process.exit(1);
    }
})();

