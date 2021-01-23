const express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
 
// Connect to the db
mongoose.connect("mongodb://localhost:27017/NodeJSDB", function (err, db) {
  if(err) throw err;
  //Write databse Insert/Update/Query code here..
  console.log('mongodb is running!');
  db.close(); //關閉連線
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./public'));

var HomeController = require('./controller/home.js');

// viewed at http://localhost:8080
app.get('/',function(req, res) {
    res.sendFile(path.join(__dirname + '/view/index.html'));
});

app.post('/GetZipCodes', HomeController.GetZipCodes);
app.post('/InsertZipCode', HomeController.InsertZipCode);
app.put('/UpdateZipCode', HomeController.UpdateZipCode);
app.delete('/DeleteZipCode/:id', HomeController.DeleteZipCode);
app.listen(8080);

module.exports = mongoose;