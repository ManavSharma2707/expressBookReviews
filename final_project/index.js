const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const { JWT_SECRET } = require('./router/auth_users.js');
const genl_routes = require('./router/general.js').general;
const { runAxiosDemo } = require('./router/general.js');

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    // The login route stores { accessToken, username } in the session
    if (!req.session || !req.session.authorization) {
        return res.status(403).json({message: "User not logged in"});
    }
    const token = req.session.authorization['accessToken'];
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({message: "User not authenticated"});
        }
        req.user = user;
        next();
    });
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>{
    console.log("Server is running on port " + PORT);
    // Optional: start with  RUN_AXIOS_DEMO=1 node index.js  to run the Task 11 Axios functions
    if (process.env.RUN_AXIOS_DEMO) {
        runAxiosDemo();
    }
});
