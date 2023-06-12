const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;
const users = require("./router/auth_users.js").users;
const app = express();

app.use(express.json());

app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

app.use("/customer/auth/*", function auth(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).json({ message: "please login!" });
  }

  const token = authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "please login!" });
  }
  const data = jwt.verify(token, "fingerprint_customer");
  if (!data) {
    return res.status(200).json({ success: false, msg: "please login!" });
  }
  const { username, password } = data;
  for (let i = 0; i < users.length; i++) {
    if (users[i].username === username && users[i].password === password) {
      next();
      return;
    }
  }
  return res.status(401).json({ message: "Unauthorized" });
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
