var express = require('express'),
    app = express(),
    mysql = require('mysql');
var connectionpool = mysql.createPool({
    host: 'piingo.cxuugbfdvub0.ap-southeast-1.rds.amazonaws.com',
    user: 'piingo',
    password: 'TMpiingo123',
    database: 'piing'
});
app.get('/getlatlong/:pid', function (req, res) {
    connectionpool.getConnection(function (err, connection) {
        if (err) {
            console.error('CONNECTION error: ', err);
            res.statusCode = 503;
            res.send({
                result: 'error',
                err: err.code
            });
        } else {

            if (req.params.pid == 0) {

                connection.query('SELECT * FROM piingo_lat_lon_position', function (err, rows, fields) {
                    if (err) {
                        console.error(err);
                        res.statusCode = 500;
                        res.send({
                            result: 'error',
                            err: err.code
                        });
                    }
                    res.send({
                        result: 'success',
                        err: '',
                        fields: '',
                        json: rows,
                        length: rows.length
                    });
                    connection.release();
                });
            } else {

                connection.query('SELECT * FROM piingo_lat_lon_position where PID ="' + req.params.pid + '"', function (err, rows, fields) {
                    if (err) {
                        console.error(err);
                        res.statusCode = 500;
                        res.send({
                            result: 'error',
                            err: err.code
                        });
                    }
                    res.send({
                        result: 'success',
                        err: '',
                        fields: '',
                        json: rows,
                        length: rows.length
                    });
                    connection.release();
                });
            }
        }
    });
});
app.get('/:table/:id', function (req, res) {
});
app.post('/:table', function (req, res) {
});
app.put('/:table/:id', function (req, res) {
});
app.delete('/:table/:id', function (req, res) {
});
app.listen(3004);
console.log('Rest Piing Listening ');
