var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
function random() {
    return parseInt(Math.random() * 100)
}
io.on('connection', function (socket) {
//    io.sockets.emit('Refreshed');
    console.log('user connected');
    socket.on('addMe', function (data) {
        var user = data.user
        socket.username = user
        socket.room = user
        socket.join(user)
    })
    socket.on('disconnect', function () {
        console.log('user disconnected');
    })
    socket.on('sendCommand', function (data) {
        io.in(data.To).emit('NewLatLon', {data: data.data, From: data.From});
//        socket.broadcast.emit('NewLatLon',{data:data.data,From:'all clients except sender'});
//        io.sockets.emit('NewLatLon',{data:data.data,From:'all clients include sender'});
    })

});
server.listen(3001, function () {

    var host = server.address().address;
    var port = server.address().port;
    console.log('Socket app listening at http://%s:%s', host, port);

});
app.get('/', function (req, res) {
    res.send('Welcome')
    io.in('admin').emit('NewLatLon', {data: {lat: '1', lon: '2'}, From: 'server'});
})