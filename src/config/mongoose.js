import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost/officeDB')
    .then(() => console.log('connected to mongodb ...'))
    .catch(err => console.error('could not connect to mongodb ' + err))