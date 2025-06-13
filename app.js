require('dotenv').config();
const express =  require('express');
const path = require('path');
global.rootPath = path.resolve(__dirname);
const logger = require('morgan');
const helmet = require("helmet");
const cors =  require('cors');
const app     = express();
const PORT    = process.env.PORT || 3002;
// cron section
const {sheduleImportUsers} = require('./cron');
sheduleImportUsers.start();



// allow request from following URL's
var corsOptions = {
    origin: 'http://xxxxxx',
    optionsSuccessStatus: 200 // For legacy browser support
}
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(logger('dev'));



app.use('/api',require('./routes'));
app.use(express.static('./client'));
app.get('/',async (req,res)=>{
    res.sendFile("index")
});

app.listen(PORT,(err)=>{
        if(err){
            console.log('error');
        }
        console.log(`Server is running on http://localhost:${PORT}  ...`)
})