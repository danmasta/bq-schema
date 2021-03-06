# Bq Schema
[Bigquery](https://cloud.google.com/bigquery/) schema generator and validator for node apps

Features:
* Easy to use
* Generate bigquery schemas from js objects
* Validate objects against a schema
* Supports all bigquery [data types](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types), except geography
* Supports nested and repeated fields
* Includes cli tool and node api
* Supports the exact spec for date, time, datetime, and timestamp fields

## About
We needed a way to easily generate big query schemas for complex data structures. There wasn't really any good tools, and the ones that were available incorrectly defined timestamp fields and didn't support other date/time formats. This package attempts adhere to the bigquery spec for validating all [data types](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types). The regex was generated from the bigquery spec and attempts to be fully compliant. It can also take into account the number of days per month, and adjust for leap year.

## Usage
Add bq-schema as a dependency for your app and install via npm
```
npm install @danmasta/bq-schema --save
```
Require the package in your app
```javascript
const bqschema = require('@danmasta/bq-schema');
```

### Options - Generator
name | type | description
-----|----- | -----------
`types` | *`object`* | Map of key names -> bigquery type, used for manually specifying field types. When generating a schema, if the field name key exists in this map, the type from the map is used vs infering it automatically. Default is `null`
`required` | *`object`* | Map of key names -> boolean, used to set requiredness of fields. If the field name key exists and is true, the field mode is set to `REQUIRED` in schema output. Default is `null`

### Options - Validator
name | type | description
-----|----- | -----------
`schema` | *`object`* | The bigquery schema to use to validate objects. Default is `null`

### Methods
Name | Description
-----|------------
`Generator(opts)` | Generator class for creating a custom bigquery schema generator
`Validator(opts)` | Validator class for creating a custom bigquery schema validator

## Examples
Create a bigquery schema
```javascript
const generator = new bqschema.Generator();

let data = {
    col1: true,
    col2: '1,000',
    col3: '2019-03-12T21:00:00.000Z'
};

let schema = generator.parse(data);
```

## Testing
Testing is currently run using mocha and chai. To execute tests just run `npm run test`. To generate unit test coverage reports just run `npm run coverage`

## Contact
If you have any questions feel free to get in touch
