const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const { logger } = require('./middleware/logEvents')
const PORT = process.env.PORT || 3500;

app.use(logger);

//cross origin resource sharing
const whitelist = ['https://www.yoursite.com', 'http://126.0.0.1:5500', 'http://localhost:3500'];
const corsOptions = {
    origin: (origin, callBack) => {
        if (whitelist.indexOf(origin) !== -1) {
            callbackify(null, true)
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
}
app.use(cors());


app.use(express.urlencoded({ extended: false }));

app.use(express.json());

//static files
app.use(express.static(path.join(__dirname, '/public')));



app.get(/^\/$|\/index(\.html)?$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/new-page.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'new-page.html'));
});

app.get(/^\/old-page(\.html)?$/, (req, res) => {
    res.redirect(301, '/new-page.html'); //301 by default
});

app.get('/*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
})

//Route handlers
app.get('/Hello(.html)?', (req, res, next) => {
    console.log('Attempted to load hello.html');
    next()
}), (req, res) => {
    res.send('Hello World!');
};

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send(err.message);
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


