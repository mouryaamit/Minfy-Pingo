var app = require('express')(),
    mysql = require('mysql'),
    server = require('http').createServer(app),
    io = require('socket.io')(server),
    customer = null || [],
    pingo = null || [];
var connectionpool = mysql.createPool({
    host: 'piingo.cxuugbfdvub0.ap-southeast-1.rds.amazonaws.com',
    user: 'piingo',
    password: 'TMpiingo123',
    database: 'piing'
});
server.listen(3003, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Pingo Socket App listening at http://%s:%s', host, port);
});
io.on('connection', function (socket) {
    console.log('user connected');
    socket.on('addMeCustomer', function (data) {
        var user = 'C' + data.user;
        socket.username = user;
        socket.room = user;
        socket.join(user);
        customer.push(user)
        console.log('Customer got socket with socketId : ' + user);
    });
    socket.on('addMePingo', function (data) {
        var user = 'P' + data.user;
        socket.username = user;
        socket.room = user;
        socket.join(user);
        pingo.push(user)
        console.log('Pingo got socket with socketId : ' + user);
    });
    socket.on('disconnect', function (data) {
        if (socket.room.split('', 1)[0] == 'C') {
            customer.pop(socket.room)
        } else if (socket.room.split('', 1)[0] == 'P') {
            pingo.pop(socket.room)
        }
    })

    socket.on('pushLatLong', function (data) {
        if (data.cid == 0) {
            socket.broadcast.emit('PickupLatLongDetailsBroadcast', data);
        } else {
            io.in('C' + data.cid).emit('PickupLatLongDetails', data);
        }
        connectionpool.getConnection(function (err, connection) {
            if (err) {
                console.error('CONNECTION error in pushlatlong : ' + err);
            } else {
                connection.query('CALL  InsertUpdate_PiingoLatLonUsingNodeJS("' + data.pid + '",0,"' + data.lat + '","' + data.long + '","' + data.cid + '")', function (err, rows, fields) {
                    if (err) {
                        console.error('DB error in pushlatlong : ' + err.code);
                    }
                    connection.release();
                });
            }
        });
    })

});
