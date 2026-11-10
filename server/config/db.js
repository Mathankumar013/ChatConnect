const mongoose = require('mongoose');

mongoose.connect(process.env.MONGOOSE_URL)
.then(()=>{
    console.log('mongoose Connected successfully')
})
.catch((err)=>{
    console.log('mongoose connected failed',err)
})
module.exports = mongoose;