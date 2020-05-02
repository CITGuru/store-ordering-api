const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const cors = require("cors");
const { LiveDB } = require("./db");
const tokenModel = require("./models/tokens")
const orderModel = require("./models/orders")
const { check, validationResult } = require("express-validator");

const port = process.env.PORT || 3200;

LiveDB.startDB();

//Middle ware

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));


app.get("/", function(req, res, next){
  res.send("Hurray! Its live.")
})

app.get("/docs", function(req, res, next){
  const body = `
  <h1>Food Ordering</h1>
  
  <h5>Request Token (POST): <code>/request-token</code></h5>
  
  <h2>Authentication</h2>

  <p>Authentication : Basic (token) </p>

  <h5>Get all orders (GET):<code>/orders</code></h5>
  <h5>New order (POST):<code>/new_order</code></h5>
  <pre>
    {
      "name":"Sandine (Milo)",
      "customer_email":"oyetoketoby80@gmail.com",
      "customer_name":"Oyetoke Toby",
      "quantity":5,
      "customer_address": "Aboru, Lagos"
    }
  </pre>
  <h5>Get order (GET):<code>/orders/:id</code></h5>
  <h5>Update order (PUT):<code>/orders/:id</code></h5>
  <pre>
    {
      "status":"completed"
    }
  </pre>
  <h5>Delete order (DELETE):<code>/orders/:id</code></h5>
  <h5>Filter order (GET):<code>/orders/filter?status=completed</code></h5>
  `
  res.send(body)
})

app.post("/request-token", async function(req, res, next){

  const token = new tokenModel()
  await token.save()
  res.status(201).json({token:token.token})
})

let formatError = error => {
  let result = error[0].msg;
  result += " for " + error[0].param + " field";
  return result;
};

/**
 * creating a New order
 */

app.post("/new_order",[
  check("name").isLength({min:3}),
  check("customer_name").isLength({min:3}),
  check("customer_email").isEmail(),
  check("quantity").isNumeric(),
  check("customer_address").optional()

],validateAuthKey,async (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let formattedError = formatError(errors.array());
    return res.status(422).json({ errors: formattedError });
  }

  const body = req.body;
  const order = await orderModel.create({
    ...body,
    status: "pending"
  })
  res.status(200).json({
    message: "Order created successfully",
    data: {
      ...order._doc,
      token: null
    }
  });
});

/**
 *  Getting All orders
 */

app.get("/orders", validateAuthKey, async (req, res) => {
  const orders = await orderModel.find({token:req.body.token}).select("-token")
  res.status(200).send(orders);
});

/**
 *  Filter All orders
 */

app.get("/orders/filter", validateAuthKey, async (req, res) => {
  const orders = await orderModel.find({token:req.body.token, ...req.query}).select("-token")
  res.status(200).send(orders);
});

/**
 * Get order
 */

app.get("/orders/:id", validateAuthKey, async (req, res) => {
  const order = await orderModel.findOne({_id:req.params.id,token:req.body.token}).select("-token")
  if(order){
    res.status(200).json(order);
  }else{
    res.status(404).json({ message: "Order not found" });
  }
});

/**
 * Update order
 */
app.put("/orders/:id",
[
  check("quantity").optional(),
  check("status").optional(),
  check("customer_address").optional()
],
validateAuthKey, async (req, res) => {
  const order_id = req.params.id;
  const order_update = req.body;
  const order = await orderModel.findOneAndUpdate({_id:order_id, token: req.body.token}, {...order_update})
  if(order){
    res
        .status(200)
        .json({ message: "Updated Succesfully", data: {...order._doc, ...req.body, token: null} });
  }else{
    res.status(404).json({ message: "Order not found" });
  }
});

/**
 * Delete Order
 */
app.delete("/orders/:id", validateAuthKey, async (req, res) => {
  const order_id = req.params.id;
  const order = await orderModel.findOneAndDelete({_id:order_id, token: req.body.token})

  if(order){
    res.status(200)
        .json({ message: "Deleted Succesfully"});
  }else{
    res.status(404).json({ message: "Order not found" });
  }
});

async function validateAuthKey(req, res, next) {
  const authKey = req.headers["authorization"]
  let response = {};
    if (!authKey) {
      return res.status(401).json({status:"error", message: "Please make sure you send a request with authorization header", data:null});
    }
    const auth_token = req.headers.authorization.split(" ");
    const token = auth_token[1];
    const type = auth_token[0];
    switch (type) {
      case "Basic":
        try {
          const tokenKey = await tokenModel.findOne({token: token})

          if(tokenKey){
            req.body.token = tokenKey.token;
            next();
          }else{
            return res.status(401).json({status:"error", message: "Authorization Denied. Check authentication token", data:null});

          }
        } catch (err) {
        return res.status(401).json({status:"error", message: "There seems to be an error while authenticating the token", data:null});
        }
        break;
      default:
        return res.status(401).json({status:"error", message: "Invalid auth token type. Type must be Bearer", data:null});
    }
  
}

// app.use(function(req, res, next){
//   console.log(req)
//   next()
// })

app.use(function(req, res, next) {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// handle errors
app.use(function(err, req, res, next) {
  console.log(err);

  if (err.status === 404) res.status(404).json({ message: "Not found" });
  else
    res
      .status(500)
      .json({ message: "Internal Server error -- Something looks wrong" });
});

app.listen(port, () => {
  console.log(`running at port ${port}`);
});
