import fs from 'fs'
export default class Csv {
  constructor({
    path,
    chunkSize = 4 * 1024 * 1024,
    offset = 0,
    delimiter = ','
  }) {
    this.filePath = path
    this.offset = offset
    this.chunkSize = chunkSize
    this.delimiter = delimiter
    this.leftOver = ''
    this.rows = []
  }

  fetch (nrows = 1000) {
    if (nrows > this.rows.length) {
      return this.loadFromFile().then(rows => {
        this.rows = this.rows.concat(rows)
        return this.fetch(nrows)
      })
    } else {
      this.leftOver = ''
      return new Promise ((resolve, reject) => {
        resolve(this.rows.slice(0, nrows))
        this.rows = this.rows.slice(nrows)
      })
    }
  }

  loadFromFile  () {
    let data = []
    this.leftOver = ''
    console.log(this.offset)
    return new Promise ((resolve, reject) => {
      fs.open(this.filePath, 'r', (err, fd) => {
        let buffer = new Buffer(this.chunkSize)
        fs.read(fd, buffer, 0, this.chunkSize, this.offset, (err, nread) => {
          if (err) {
            reject(err)
            fs.close()
          }
          if (nread === 0) fs.close()
        
          if (nread < this.chunkSize) {
              data = buffer.slice(0, nread)
          } else {
              data = buffer
          }
          let text = this.leftOver + data.toString('utf8')
          let rows = text.split('\n')
          this.leftOver = rows.pop()
          data = rows.map(row => row.split(this.delimiter))
          this.offset += this.chunkSize

          resolve(data)
        })
      })
    })
  }
}