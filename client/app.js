var express = require('express');
var app = express();
var path = require('path');
app.set('port', 3000)
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    return res.render('index', {})
});
app.get('/User1', function (req, res) {
    return res.render('User1', {})
});
app.get('/User2', function (req, res) {
    return res.render('User2', {})
});

var server = app.listen(3000, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);

});