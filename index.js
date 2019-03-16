const _ = require('lodash');

const constants = {
    MODES: {
        NULLABLE: 'NULLABLE',
        REQUIRED: 'REQUIRED',
        REPEATED: 'REPEATED'
    },
    TYPES: {
        STRING: 'STRING',
        TIMESTAMP: 'TIMESTAMP',
        DATETIME: 'DATETIME',
        DATE: 'DATE',
        TIME: 'TIME',
        FLOAT: 'FLOAT',
        INTEGER: 'INTEGER',
        BOOLEAN: 'BOOLEAN',
        RECORD: 'RECORD',
        BYTES: 'BYTES'
    },
    REGEX: {
        date: `(?:((?!0000)\\d{4})-(0?[1-9]|1[0-2])-(0?[1-9]|[1-2][0-9]|3[0-1]))`,
        separator: `(?:[ T])`,
        time: `(?:(0?[0-9]|1[0-9]|2[0-3]):(0?[0-9]|[1-5][0-9]):(0?[0-9]|[1-5][0-9])(?:\\.(\\d{1,6}))?)`,
        timezone: `(?:(Z)|([+-])(0?[0-9]|1[0-9]|2[0-3])(?::(0?[0-9]|[1-5][0-9]))?|[ ](\\w+)(?:\\/(\\w+))?\\/(\\w+))`
    },
    DAYS: {
        1: 31,
        2: 28,
        3: 31,
        4: 30,
        5: 31,
        6: 30,
        7: 31,
        8: 31,
        9: 30,
        10: 31,
        11: 30,
        12: 31
    }
};

const defaults = {
    generator: {
        types: null,
        required: null
    },
    validator: {
        schema: null
    }
};

function isFloat (n) {
    return n === +n && n !== (n | 0);
}

// validates day range by month, adjusts for leap year
// validation fails if month is outside of range, or if day is outside of range
function validateDate (year, month, day) {

    let days = constants.DAYS;
    let leap = year % 4 === 0;

    if (!(year > 0 && year <= 9999)) {
        return false;
    } else if (leap && month === 2) {
        return day > 0 && day <= 29;
    } else {
        return days[month] && day > 0 && day <= days[month];
    }

}

class Generator {

    constructor (opts) {

        this.opts = _.defaults(opts, defaults.generator);

        this.regex = {
            date: new RegExp(`^${constants.REGEX.date}$`),
            time: new RegExp(`^${constants.REGEX.time}$`),
            datetime: new RegExp(`^${constants.REGEX.date}(?:${constants.REGEX.separator}${constants.REGEX.time})?$`),
            timestamp: new RegExp(`^${constants.REGEX.date}(?:${constants.REGEX.separator}${constants.REGEX.time})?${constants.REGEX.timezone}?$`)
        };

    }

    // supports all bigquery types except geopgraphy
    // https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types
    _getType (key, val) {

        let types = constants.TYPES;

        if (this.opts.types && this.opts.types[key]) {

            return this.opts.types[key];

        } else if (_.isNull(val) || _.isUndefined(val)) {

            return types.STRING;

        } else if (_.isString(val)) {

            if (this.regex.date.test(val)) {

                return types.DATE;

            } else if (this.regex.time.test(val)) {

                return types.TIME;

            } else if (this.regex.datetime.test(val)) {

                return types.DATETIME;

            } else if (this.regex.timestamp.test(val)) {

                return types.TIMESTAMP;

            } else {

                return types.STRING;

            }

        } else if (_.isNumber(val)) {

            if (isFloat(val)) {

                return types.FLOAT;

            } else {

                return types.INTEGER;

            }

        } else if (_.isBoolean(val)) {

            return types.BOOLEAN;

        } else if (_.isPlainObject(val)) {

            return types.RECORD;

        } else if (_.isArray(val)) {

            return this._getType(_.first(val));

        } else if (Buffer.isBuffer(val)) {

            return types.BYTES;
        }

    }

    _getMode (key, val) {

        let modes = constants.MODES;

        if (_.isArray(val)) {
            return modes.REPEATED;
        } else if (this.opts.required && this.opts.required[key]) {
            return modes.REQUIRED;
        } else {
            return modes.NULLABLE;
        }

    }

    _getField (key, val) {

        return {
            name: key,
            type: this._getType(key, val),
            mode: this._getMode(key, val),
            description: ''
        };

    }

    _traverse (obj) {

        let types = constants.TYPES;
        let modes = constants.MODES;

        return _.map(obj, (val, key) => {

            let res = this._getField(key, val);

            if (res.type === types.RECORD && res.mode === modes.REPEATED) {
                res.fields = this._traverse(_.first(val));
            } else if (res.type === types.RECORD) {
                res.fields = this._traverse(val);
            }

            return res;

        });

    }

    parse (obj) {
        return this._traverse(obj);
    }

}

class Validator {

    constructor (opts) {
        this.opts = _.defaults(opts, defaults.validator);
    }

    validate (obj) {

    }

}

exports.Generator = Generator;
exports.Validator = Validator;
