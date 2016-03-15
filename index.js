var path = require('path');
var express = require('express');

var app = express();

app.use(express.static('public'))

app.listen(8088, function(err) {
    if (err) {
        console.log(err);
        return;
    }

    console.log('Listening at http://localhost:'+8088);
});