import mongoose from 'mongoose'
import mockgoose from 'mockgoose'

mockgoose(mongoose).then(function () {
  mongoose.connect('mongodb://example.com/TestingDB', function (err) {
    console.error(err)
  })
}) 
