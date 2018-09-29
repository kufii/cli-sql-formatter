#!/usr/bin/env node

'use strict';

const { version } = require('./package.json');
const { promisify } = require('util');
const fs = require('fs');
const program = require('commander');
const getStdin = require('get-stdin');
const sqlFormatter = require('sql-formatter');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

program
	.version(version)
	.usage('[options]')
	.option('-f, --file <file>', 'load SQL from a file')
	.option('-o, --out <file>', 'output results to a file')
	.option('-d, --dialect <dialect>', 'which dialect to format with (sql: Standard SQL, n1ql: Couchbase N1QL, db2: IBM DB2, pl/sql: Oracle PL/SQL)', /^(sql|n1ql|db2|pl\/sql)$/i, 'sql')
	.option('-i, --indent <n>', 'number of spaces to indent with', str => parseInt(str), 2)
	.option('-t, --tab', 'indent with tabs')
	.parse(process.argv);

const getInput = () => program.file ? readFile(program.file, 'utf-8') : getStdin();
const writeOutput = output => program.out ? writeFile(program.out, output) : console.log(output);
const formatSql = sql => sqlFormatter.format(sql, {
	language: program.dialect,
	indent: program.tab ? '\t' : ' '.repeat(program.indent)
});
const run = input => writeOutput(formatSql(input));

getInput().then(run);
