const { connect } = require("mongoose")
const { MONGO_URL } = require("../constants/.envirment")

const ConnectionToDB = async () => {
    console.log("mongodb connection is loading")
    try{
        await connect(MONGO_URL)
        console.log("mongodb connected")
    }
    catch(error){
        console.error("mongodb error:",error)
    }
}

module.exports = ConnectionToDB