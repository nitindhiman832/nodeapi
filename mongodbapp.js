const express = require('express');
const app = express();
const port = 9900;
const mongo = require('mongodb');
const MongoClient=mongo.MongoClient;
const mongoURL="mongodb://localhost:27017";
const bodyParser = require('body-parser');
const cors = require('cors');
let db;
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())

//health check
app.get('/',(req,res)=>{
    res.send("Health is ok");
})

//city route
app.get('/city',(req,res)=>{
    let sortCondition = {city_name:-1};
    let limit = 100;
    if(req.query.sort && req.query.limit){
        sortCondition = {city_name:Number(req.query.sort)};
        limit = Number(req.query.limit);
    }
    else if(req.query.limit){
        limit = Number(req.query.limit)
    }
   else if(req.query.sort){
        sortCondition = {city_name:Number(req.query.sort)}
    }
    db.collection('city').find().sort(sortCondition).limit(limit).toArray((err,result)=>{
        if(err) throw err;
        res.send(result);
    });
  
})
//restaurant route with param
app.get('/rest/:id',(req,res)=>{
    var id=req.params.id;
    db.collection('restaurant').find({city:id}).toArray((err,result)=>{
        if(err) throw err;
        res.send(result);

    })
})

//restaurant route
app.get('/rest',(req,res)=>{
    var condition = {};
    if(req.query.mealtype && req.query.city){
        condition={$and:[{"type.mealtype":req.query.mealtype},{city:req.query.city}]};
    }
    else if(req.query.mealtype && req.query.cuisine){
        condition={$and:[{"type.mealtype":req.query.mealtype},{"Cuisine.cuisine":req.query.cuisine}]};
    }
    else if(req.query.mealtype && req.query.lcost && req.query.hcost){
        condition={$and:[{"type.mealtype":req.query.mealtype},{cost:{$lt:Number(req.query.hcost)
        ,$gt:Number(req.query.lcost)}}]};
    }
   else if(req.query.mealtype){
        condition={"type.mealtype":req.query.mealtype};
    }
   else if(req.query.city){
        condition={city:req.query.city};
    }
    db.collection('restaurant').find(condition).toArray((err,result)=>{
        if(err) throw err;
        res.send(result);
    });
})


//mealtype route
app.get('/meal',(req,res)=>{
    db.collection('mealtype').find().toArray((err,result)=>{
        if(err) throw err;
        res.send(result);
    });
})

//cuisine route
app.get('/cuisine',(req,res)=>{
    db.collection('cuisine').find().toArray((err,result)=>{
        if(err) throw err;
        res.send(result);
    });
})

//place order
app.post('/placeorder',(req,res)=>{
    db.collection('orders').insert(req.body,(err,result)=>{
        if(err) throw err;
        res.send('data added');
    })
})

//get all bookings
app.get('/orders',(req,res)=>{
    db.collection('orders').find().toArray((err,result)=>{
        if(err) throw err;
        res.send(result);
    })
})
///connection with mongo server
MongoClient.connect(mongoURL,(err,connection)=>{
    if(err) throw err;
    //connection with database
    db = connection.db('edu_nov');
    app.listen(port,function(err){
        if(err) throw err;
        console.log(`server is running on port number ${port}`);
    })
})

