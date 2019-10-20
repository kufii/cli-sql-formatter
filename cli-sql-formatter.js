#!/usr/bin/env node

'use strict';

const { version } = require('./package.json');
const { promisify } = require('util');
const fs = require('fs');
const program = require('commander');
const getStdin = require('get-stdin');
const sqlFormatter = require('sql-formatter-plus');
const eol = require('eol');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

program
	.version(version, '-v, --version')
	.usage('[options]')
	.option('-f, --file <file>', 'load SQL from a file')
	.option('-o, --out <file>', 'output results to a file')
	.option(
		'-d, --dialect <dialect>',
		'which dialect to format with (sql: Standard SQL, n1ql: Couchbase N1QL, db2: IBM DB2, pl/sql: Oracle PL/SQL)',
		/^(sql|n1ql|db2|pl\/sql)$/iu,
		'sql'
	)
	.option('-i, --indent <n>', 'number of spaces to indent with', str => parseInt(str), 2)
	.option('-t, --tab', 'indent with tabs')
	.parse(process.argv);

const getBlocks = text => {
	let inSingleQuote = false;
	let inDoubleQuote = false;
	let hyphenCount = 0;
	const inComment = () => hyphenCount === 2;

	const blocks = [];
	let block = '';

	for (const char of text) {
		block += char;

		if (inSingleQuote) {
			if (char === "'") inSingleQuote = false;
			hyphenCount = 0;
			continue;
		} else if (inDoubleQuote) {
			if (char === '"') inDoubleQuote = false;
			hyphenCount = 0;
			continue;
		} else if (inComment()) {
			if (char === '\n') hyphenCount = 0;
			continue;
		}

		if (char === "'") inSingleQuote = true;
		else if (char === '"') inDoubleQuote = true;
		else if (char === '-') hyphenCount++;
		else {
			hyphenCount = 0;
			if (char === ';') {
				blocks.push(block);
				block = '';
			}
		}
	}
	if (block) blocks.push(block);

	return blocks;
};

const getInput = () => (program.file ? readFile(program.file, 'utf-8') : getStdin());
const writeOutput = output => (program.out ? writeFile(program.out, output) : console.log(output));
const getConfig = () => ({
	language: program.dialect,
	indent: program.tab ? '\t' : ' '.repeat(program.indent)
});
const formatSql = sql =>
	getBlocks(eol.lf(sql))
		.map(b => sqlFormatter.format(b, getConfig()))
		.join('\n\n')
		.trim() + '\n';
const run = input => writeOutput(formatSql(input));

getInput().then(run);
