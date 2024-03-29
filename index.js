const express = require("express");
const mainRouter=  require("./routes/index.js")
const app  = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const PORT = 3000;


app.use(cors())
app.use(express.json());

app.use("/api/v1",mainRouter);

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})
