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
        if(typeof(data) != "object"){
            data = JSON.parse(data);
        }
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
        if(typeof(data) != "object"){
            data = JSON.parse(data);
        }
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
        console.log('user ' + socket.room + ' disconnected')
        if(socket.room != undefined){
        if (socket.room.split('', 1)[0] == 'C') {
            customer.pop(socket.room)
            socket.broadcast.emit('totalCustomerOnline', customer.length);
        } else if (socket.room.split('', 1)[0] == 'P') {
            pingo.pop(socket.room)
            socket.broadcast.emit('totalPingoOnline', pingo.length);
        }
        io.in(socket.room).emit('Reconnect'); // Reconnect if other place login
        }
    });

    socket.on('checkOnlineDetails', function (data) {
        socket.emit('totalCustomerOnline', customer.length);
        socket.emit('totalPingoOnline', pingo.length);
    })

    socket.on('pushLatLong', function (data) {
        if(typeof(data) != "object"){
            data = JSON.parse(data);
        }
        if (data.cid == 0) {
            socket.broadcast.emit('PickupLatLongDetailsBroadcast', data);
        } else {
            io.in('C' + data.cid).emit('PickupLatLongDetails', data);
        }
        connectionPool.getConnection(function (err, connection) {
            if (err) {
                console.error('CONNECTION error in pushlatlong : ' + err);
            } else {
                connection.query('CALL  InsertUpdate_PiingoLatLonUsingNodeJS_customerid("' + data.pid + '",0,"' + data.lat + '","' + data.long + '","' + data.cid + '")', function (err, rows, fields) {
                    if (err) {
                        console.error('DB error in pushlatlong : ' + err.code);
                    } else {
                        console.log('pushlatlong completed')
                    }
                    connection.release();
                });
            }
        });
    });

    socket.on('bookNow', function (data) {
        if(typeof(data) != "object"){
            data = JSON.parse(data);
        }
        connectionPool.getConnection(function (err, connection) {
            if (err) {
                io.in('C' + data.cid).emit('bookingFail', data);
                console.error('CONNECTION error in bookNow : ' + err);
            } else {
                connection.query('CALL  InsertUpdate_NodeJSBookNowDetails("' + data.pid + '","' + data.cid + '","'+data.cobId+'")', function (err, rows, fields) {
                    if (err) {
                        io.in('C' + data.cid).emit('bookingFail', data);
                        console.error('DB error in bookNow : ' + err.code);
                    } else {
                        io.in('C' + data.cid).emit('bookingSuccess', data);
                        io.in('P' + data.pid).emit('bookingSuccess', data);
                        console.log('bookNow completed')
                    }
                    connection.release();
                });
            }
        });
    });

    socket.on('cancelBooking', function (data) {
        if(typeof(data) != "object"){
            data = JSON.parse(data);
        }
        connectionPool.getConnection(function (err, connection) {
            if (err) {
                io.in('C' + data.cid).emit('cancelFail');
                console.error('CONNECTION error in cancelBooking : ' + err);
            } else {
                connection.query('CALL  InsertUpdate_NodeJSCancelBookingDetails("' + data.pid + '","' + data.cid + '","'+data.cobId+'")', function (err, rows, fields) {
                    if (err) {
                        io.in('C' + data.cid).emit('cancelFail');
                        console.error('DB error in cancelBooking : ' + err.code);
                    } else {
                        io.in('C' + data.cid).emit('cancelSuccess');
                        io.in('P' + data.pid).emit('cancelSuccess');
                        console.log('cancelBooking completed')
                    }
                    connection.release();
                });
            }
        });
    });

    socket.on('pickupConfirm', function (data) {
        if(typeof(data) != "object"){
            data = JSON.parse(data);
        }
        connectionPool.getConnection(function (err, connection) {
            if (err) {
                io.in('C' + data.cid).emit('pickupFail');
                console.error('CONNECTION error in pickupConfirm : ' + err);
            } else {
                connection.query('CALL  InsertUpdate_NodeJSPickupConfirmDetails("' + data.pid + '","' + data.cid + '","'+data.cobId+'")', function (err, rows, fields) {
                    if (err) {
                        io.in('C' + data.cid).emit('pickupFail');
                        console.error('DB error in pickupConfirm : ' + err.code);
                    } else {
                        io.in('C' + data.cid).emit('pickupConfirm');
                        io.in('P' + data.pid).emit('pickupConfirm');
                        console.log('pickupConfirm completed')
                    }
                    connection.release();
                });
            }
        });

    });
    socket.on('getAllPingoWithNullCid', function (data) {
        if(typeof(data) != "object"){
            data = JSON.parse(data);
        }
        connectionPool.getConnection(function (err, connection) {
            if (err) {
                console.error('CONNECTION error in getAllPingoWithNullCid : ' + err);
            } else {
                connection.query('CALL  Get_PiiingLatLonForCSSByZoneId("' + data.zoneid + '")', function (err, rows, fields) {
                    if (err) {
                        console.error('DB error in getAllPingoWithNullCid : ' + err.code);
                    } else {
                        socket.emit('getAllPingoWithNullCidResponse',rows)
                        rows.forEach(function(r){
                            io.in('P'+ r.pid).emit('getLatLong');
                        })
                        console.log('getAllPingoWithNullCid completed')
                    }
                    connection.release();
                });
            }
        });
    });

/*
    socket.on('onLogin', function(data){
        if(typeof(data) != "object"){
            data = JSON.parse(data);
        }
//        if(){
        socket.emit('loginSuccess', data);
//        } else {
        socket.emit('loginFail', data);
//        }
    });

    socket.on('onLogout', function(data){
        if(typeof(data) != "object"){
            data = JSON.parse(data);
        }
//        if(){
        socket.emit('logoutSuccess', data);
//        } else {
        socket.emit('logoutFail', data);
//        }
    });
*/
});
