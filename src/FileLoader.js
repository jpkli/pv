let formats = {
  text: 'text',
  array: 'array',
  json: 'json'
}

export default class FileLoader {

  constructor({
    file,
    skip = 0,
    chunk = 64 * 1024,
    delimiter = ','
  }) {
    if (typeof (file) === 'undefined') {
      throw Error('No file provided for FileLoader.')
    }
    this.file = file
    this.fileSize = file.size
    this.reader = new FileReader()
    this.skip = skip
    this.chunk = chunk
    this.delimiter = delimiter
    this.reset()
  }

  static get format() {
    return formats
  }

  reset() {
    this.offset = 0
    this.lineTotal = 0
    this.leftOver = ''
  }

  parseDataSchema(rows) {
    let delimiter = rows[0].match(/(\,|\:|\t|\s{2,})/g)[0] || ','
    let header = rows[0].split(delimiter)
    let values = rows[1].split(delimiter)
    let schema = header.map((f, i) => {
      return {
        name: f,
        dtype: Number.isNaN(Number(values[i])) ? 'string' : 'int'
      }
    })
    this.delimiter = delimiter
    for (let rid = 1; rid < rows.length; rid++) {
      let values = rows[rid].split(delimiter)
      for (let fid = 0; fid < header.length; fid++) {
        let value = values[fid]
        if (schema[fid].dtype === 'int' && parseInt(value) !== parseFloat(value)) {
          schema[fid].dtype = 'float'
        }
      }
    }
    return schema
  }

  errorHandler(evt) {
    switch (evt.target.error.code) {
      case evt.target.error.NOT_FOUND_ERR:
        throw Error('File Not Found!', evt.target.error)

      case evt.target.error.NOT_READABLE_ERR:
        throw Error('File is not readable', evt.target.error)
      case evt.target.error.ABORT_ERR:
        throw Error('Aborted', evt.target.error)
      default:
        throw Error('An error occurred reading this file.', evt.target.error)
    };
  }

  getSchema() {
    this.reader.readAsBinaryString(this.file.slice(0, this.chunk / 16));
    return new Promise((resolve, reject) => {
      this.reader.onloadend = (evt) => {
        if (evt.target.readyState == FileReader.DONE) {
          let rawText = this.leftOver + evt.target.result
          let lines = rawText.split('\n')
          let schema = this.parseDataSchema(lines.slice(0, 10))
          resolve(schema)
        }
      }
      this.reader.onerror = (evt) => {
        reject(this.errorHandler(evt))
      }
    })
  }

  read(format) {
    this.reader.readAsBinaryString(this.file.slice(this.offset, Math.min(this.file.size, this.offset + this.chunk)));
    return new Promise((resolve, reject) => {
      this.reader.onloadend = (evt) => {
        if (evt.target.readyState == FileReader.DONE) {
          let rawText = this.leftOver + evt.target.result
          let lines = rawText.split('\n')
          this.leftOver = lines.pop()
          this.offset += this.chunk
          let results
          if (format == FileLoader.format.text) {
            results = lines
          } else {
            results = lines.map((line) => line.split(this.delimiter))
          }
          resolve(results)
        }
      }
      this.reader.onerror = (evt) => {
        reject(this.errorHandler(evt))
      }
    })
  }

  readAll(onprocess) {
    if (typeof onprocess !== 'function') {
      throw Error('undefined function specified for reading file content')
    }
    this.reader.readAsBinaryString(this.file.slice(this.offset, this.offset + this.chunk))
    return new Promise((resolve, reject) => {
      this.reader.onloadend = (evt) => {
        if (evt.target.readyState == FileReader.DONE) {
          let rawText = this.leftOver + evt.target.result
          let lines = rawText.split('\n')
          this.leftOver = lines.pop()

          if (this.offset == 0 && this.skip > 0) {
            if (this.skip > 0) lines.shift()
          }

          onprocess(lines.map((line) => line.split(this.delimiter)))
          this.lineTotal += lines.length

          if (this.offset < this.file.size) {
            this.offset += this.chunk
            this.reader.readAsBinaryString(this.file.slice(this.offset, this.offset + this.chunk));
          } else {
            resolve(this.lineTotal)
          }
        }
      }
      this.reader.onerror = (evt) => {
        reject(this.errorHandler(evt));
      }
    })
  }
}
