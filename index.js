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

const debug = ('' + core.getInput('debug')) === "true";

let version = core.getInput('version') || process.env.version;
if (!version) version = "0";
version = version.replace(/v/g, '');

let filename = core.getInput('files');
let modules = (core.getInput('modules') || 'core,pops').split(',');


if (version === "0") {
    console.log('version is required parameter')
    process.exit(1);
    return;
}

if (!filename) {
    console.log('files is required parameter')
    process.exit(1);
    return;
}

(async () => {
    const files = await globby(filename);

    if (debug) {
        console.log('setVersion: start');
        console.log('setVersion:', filename);
        console.log('setVersion:', files);
        console.log('setVersion: modules', modules);
    }

    if (files.length > 0) {
        console.log("setVersion: ", version);

        for (let i = 0; i < files.length; i++) {
            let filename = path.join(process.cwd(), files[i]);

            if (debug)
                console.log('setVersion: reading -', filename);

            let data = await readFile(filename, 'utf8');

            if (debug)
                console.log('setVersion: \n', data);

            for (let i = 0; i < modules.length; i++) {
                let module = modules[i];
                if (debug) console.log('setVersion: replacing ', module);

                let rex = new RegExp('"' + module + '"\\s?:\\s?"(.*)"', "g");
                let matches = data.match(rex);
                if (!matches) {
                    if (debug) console.log("no matches for: ", module);
                    continue;
                } else if (debug) {
                    console.log(matches.length, " matches for: ", module);
                }
                for (let j = 0; j < matches.length; j++) {
                    data = data.replace(matches[j], '"' + module + '":"' + version + '"');
                }
            }

            if (!debug) await writeFile(filename, data);
            else console.log(data);
            console.log('setVersion: writing -', filename);
        }
        console.log('setVersion: done');

        process.exit(0);
    } else {
        console.log("setVersion: version file file found");
        process.exit(1);
    }
})();

