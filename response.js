const response = (statuscode, data,message,res)=>{
    res.json(statuscode,[
        {
            data,
            message,
            metadata:{
                prev:"",
                next:"",
                current:""
            },
        },
    ])
}

module.exports = response