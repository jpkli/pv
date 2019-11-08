import mysql from 'mysql'

export default class Rdb {
    constructor({
        host = 'localhost',
        user,
        password,
        database,
        query
    }) {
        this.source = { host, user, password, database};
        this.query = query || 'select * from ' + database
        this.loaded = 0
    }

    fetch (numRows = 1000, offset) {
        let db = mysql.createConnection(this.source)
        let start = offset || this.loaded
        db.connect()
        return new Promise ((resolve, reject) => {
            db.query(this.query + ' limit ' + [start, numRows].join(','), (error, results, fields) => {
                if (error) reject(error);
                resolve(results)
                db.end()
                this.loaded += numRows
            })
        })
    }
}