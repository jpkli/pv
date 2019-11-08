import express from 'express'
import http from 'http'

let app = express()
let server = http.Server(app)
let port = process.env.PORT || 7000
let host = process.env.HOST || "localhost"
let WebSocketServer = require('ws').Server
let wss = new WebSocketServer({ server })

app.use('/dist', express.static('dist'))
app.use('/test', express.static('test'))
app.use('/demos', express.static('demos'))

wss.on('connection', function connection (ws) {
  console.log('new connection');
  ws.on('message', function incoming (msg) {
    console.log(msg)
  })
})

import Mysql from './loaders/Mysql'
import datasets from '../test/datasets.json'
import Csv from './loaders/Csv'
import Model from './loaders/Model'

function Dataset (dsName) {
  let dataset = datasets[dsName]
  if(dataset.type === 'mysql') {
    return {
      schema: dataset.schema,
      source: new Mysql(dataset.source)
    }
  } else if(dataset.type === 'file') {
    return {
      schema: dataset.schema,
      source: new Csv(dataset.source)
    }
  } else if(dataset.type === 'synthetic' || dataset.type === 'model') {
    return {
      schema: dataset.schema,
      source: new Model(dataset.source)
    }
  }
}

let selectedDataset = null

app.get('/data/:dataset', function (req, res) {
  let dataset = req.params.dataset
  let start = req.query.start
  let nrows = req.query.nrows || 10000
  if (selectedDataset === null) selectedDataset = Dataset(dataset)
  
  selectedDataset.source.fetch(nrows, start).then(result => {
    res.json({
      schema: selectedDataset.schema,
      data: result
    })
  })
})

app.get('/testdata', function (req, res) {
  res.json({data: 'test'})
})

server.listen(port, host, function() {
  console.log("server started, listening", host, port)
})
