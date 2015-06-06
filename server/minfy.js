/**
 * Created by Amit Mourya <amourya@vsoftcorp.com> on 6/3/15.
 */
var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

io.on('connection', function (socket) {
    socket.on('addMe', function (data) {
        var user = data.user
        socket.username = user
        socket.room = user
        socket.join(user)
    })
    socket.on('disconnect', function () {
        console.log('user disconnected');
    })

    // emit lat long of delivery. from delivery to customer
    io.in(CustomerId).emit('updateLatLong', {DeliveryId: DeliveryId, Lat: Lat, Long: Long});

    // add method in delivery pickup done time. from delivery to customer
    io.in(CustomerId).emit('pickupConfirm', {DeliveryId: DeliveryId, BookingId: BookingId});

    // add method in customer booking time. from customer to delivery
    io.in(DeliveryId).emit('newBooking', {Address: AddressOfCustomer, CustomerId: CustomerId, Lat: Lat, Long: Long});
    // add method in customer cancel booking time. from customer to delivery
    io.in(DeliveryId).emit('cancelBooking', {CustomerId: CustomerId, BookingId: BookingId});
});

server.listen(3002, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Socket app listening at http://%s:%s', host, port);
});