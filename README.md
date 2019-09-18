# cli-sql-formatter

A console interface for [sql-formatter](https://github.com/zeroturnaround/sql-formatter)

## Installation

This tool can be installed via npm

```shell
npm install -g cli-sql-formatter
```

## Usage

```shell
$ cli-sql-formatter -h
Usage: cli-sql-formatter [options]

Options:

  -v, --version            output the version number
  -f, --file <file>        load SQL from a file
  -o, --out <file>         output results to a file
  -d, --dialect <dialect>  which dialect to format with (sql: Standard SQL, n1ql: Couchbase N1QL, db2: IBM DB2, pl/sql: Oracle PL/SQL) (default: sql)
  -i, --indent <n>         number of spaces to indent with (default: 2)
  -t, --tab                indent with tabs
  -h, --help               output usage information

$ echo "SELECT * FROM table WHERE n = 1" | cli-sql-formatter
SELECT
  *
FROM
  table
WHERE
  n = 1
```
