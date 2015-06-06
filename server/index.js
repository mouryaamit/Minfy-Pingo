var app = require('express')(),
    mysql = require('mysql'),
    server = require('http').createServer(app),
    io = require('socket.io')(server),
    customer = null || [],
    pingo = null || [],
    connectionPool,
    port = 3003;

connectionPool = mysql.createPool({
    host: 'piingo.cxuugbfdvub0.ap-southeast-1.rds.amazonaws.com',
    user: 'piingo',
    password: 'TMpiingo123',
    database: 'piing'
});

server.listen(port, function () {
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
        if(customer.indexOf(user) < 0){
            customer.push(user)
        }
        console.log('Customer got socket with socketId : ' + user);
        socket.broadcast.emit('totalCustomerOnline', customer.length);
    });

    socket.on('addMePingo', function (data) {
        var user = 'P' + data.user;
        socket.username = user;
        socket.room = user;
        socket.join(user);
        if(pingo.indexOf(user) < 0){
            pingo.push(user)
        }
        console.log('Pingo got socket with socketId : ' + user);
        socket.broadcast.emit('totalPingoOnline', pingo.length);
    });

    socket.on('disconnect', function (data) {
        if (socket.room.split('', 1)[0] == 'C') {
            customer.pop(socket.room)
            socket.broadcast.emit('totalCustomerOnline', customer.length);
        } else if (socket.room.split('', 1)[0] == 'P') {
            pingo.pop(socket.room)
            socket.broadcast.emit('totalPingoOnline', pingo.length);
        }
        io.in(socket.room).emit('Reconnect'); // Reconnect if other place login
    });

    socket.on('checkOnlineDetails', function (data) {
        socket.emit('totalCustomerOnline', customer.length);
        socket.emit('totalPingoOnline', pingo.length);
    })

    socket.on('pushLatLong', function (data) {
        if (data.cid == 0) {
            socket.broadcast.emit('PickupLatLongDetailsBroadcast', data);
        } else {
            io.in('C' + data.cid).emit('PickupLatLongDetails', data);
        }
        connectionPool.getConnection(function (err, connection) {
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
    });

    socket.on('bookNow', function (data) {
        //        if(){ //booked
        io.in('C' + data.cid).emit('bookingSuccess', data);
        io.in('P' + data.cid).emit('bookingSuccess', data);
//        } else { not booked
        io.in('C' + data.cid).emit('bookingFail', data);
//    }
    });

    socket.on('cancelBooking', function (data) {
//        if(){ //cancelled
        io.in('C' + data.cid).emit('cancelSuccess', data);
        io.in('P' + data.cid).emit('cancelSuccess', data);
//        } else { not cancelled
        io.in('C' + data.cid).emit('cancelFail', data);
//    }
    });

    socket.on('pickupConfirm', function (data) {
        io.in(CustomerId).emit('pickupConfirm', {DeliveryId: DeliveryId, BookingId: BookingId});
    });

    function getAllPingoWithNullCid(){
        var pingosWithNullCid = []//logic for finding pingo with 0 cid
        for(var i = 0; i < pingosWithNullCid.length; i++){
            io.in('P'+pingosWithNullCid[i]).emit('getLatLong');
        }
    }

    socket.on('onLogin', function(data){
//        if(){
        socket.emit('loginSuccess', data);
//        } else {
        socket.emit('loginFail', data);
//        }
    });

    socket.on('onLogout', function(data){
//        if(){
        socket.emit('logoutSuccess', data);
//        } else {
        socket.emit('logoutFail', data);
//        }
    });
});
