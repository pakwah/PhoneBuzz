var twilio = require('twilio');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var http = require('http').Server(app);

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function (req, res) {

    var resp = new twilio.TwimlResponse();

    resp.gather({action:'/reply', method: 'POST', timeout:5, finishOnKey:'#'}, function() {
        this.say({voice:'man'}, 'Welcome to Phonebuzz! Please enter your number, followed by pound.');
    });

    res.writeHead(200, {
        'Content-Type':'text/xml'
    });
    res.end(resp.toString());

});

app.post('/reply', function(req, res) {
    var resp = new twilio.TwimlResponse();

    var mUrl = req.protocol + 's://' + req.get('host') + req.originalUrl;

    res.writeHead(200, {
        'Content-Type':'text/xml'
    });

    if (!twilio.validateRequest(process.env.AUTH_TOKEN, req.get('X-Twilio-Signature'), mUrl, req.body)) {
        resp.say('Request cannot be validated, good bye.').hangup();
        res.end(resp.toString());
    } else {

        var targetNum = req.body['Digits'];

        if (targetNum.indexOf('*') !== -1) {
            resp.say('You must enter a valid number consists of digits from 0 to 9. Please try again.');
            res.end(resp.toString());
        }

        // Get rid of leading 0's
        targetNum = targetNum.replace(new RegExp('^0+'), '');

        resp.say('The number you have entered is: ' + targetNum + ". The result for this round is: ");

        for (var i = 1; i <= targetNum; ++i) {
            if (i % 3 === 0 && i % 5 === 0) {
                resp.say("Fizz Buzz");
            } else if (i % 3 === 0) {
                resp.say("Fizz");
            } else if (i % 5 === 0) {
                resp.say("Buzz");
            } else {
                resp.say(i.toString());
            }
        }

        resp.say("Thank you for playing, good bye.");
    }

    res.end(resp.toString());
});

// Create an HTTP server, listening on port 1337
http.listen(process.env.PORT, function(){
    console.log("Server is up at port " + process.env.PORT);
});