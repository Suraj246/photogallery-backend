const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const userProfile = require("./model/imageModel");
const multer = require("multer");
const upload = multer({ dest: 'uploads/' })
// const User = require("./model/authModel")
// const fileUpload = require("express-fileupload")
// const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const app = express()

app.use('/uploads', express.static('uploads'))

mongoose.connect(process.env.DATABASE)
    .then(() => { console.log("database is connected"); })
    .catch((err) => { console.log(err) })

app.use(
    cors(
        {
            origin: ["http://localhost:3000"],
            // methods: ["GET", "POST", "DELETE"],
            credentials: true,
        }
    )
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/", authRoutes);

// app.use(fileUpload())

// below commented code is nothing to do with main code it is for practical purposes
//express upload code
// const staticPath = path.join(__dirname, "");
// console.log(staticPath)
// app.post('/upload', (req, res) => {
//     if (req.files === null) {
//         return res.status(404).json({ message: "file not uploaded" });
//     }
//     const file = req.files.file

//     file.mv(`${__dirname}/uploads/${file.name}`, err => {
//         // file.mv(`${__dirname}/middleware/public/uploads/${file.name}`, err => {
//         if (err) {
//             return res.status(500).json({ msg: err })
//         }
//         res.json({ fileName: file.name, filePath: `/uploads/${file.name}` })
//     })
// })


// multer code


app.get('/api/getimage', async (req, res) => {
    const _data = await userProfile.find({})
    if (_data) {
        res.status(200).json({ data: _data })
    }
})


app.post("/api/image", upload.single("image"), (req, res) => {
    console.log("post", req.file)
    const profile = req.file ? req.file.filename : null
    const img = new userProfile({ profile, title: req.file.originalname, type: req.file.mimetype })
    if (!profile) {
        res.status(404).json({ error: "failed to upload profile" })
    }
    img.save()
    console.log("img", img)
})


//delete single items
// app.delete("/delete/:id", async (req, res) => {
//     console.log("req", req.params)
//     const result = await userProfile.findByIdAndDelete({ _id: req.params.id })
//     console.log("result", result)
// });

//delete multiple items
app.post("/delete", async (req, res) => {
    // console.log("body", req.body)
    const ids = req.body
    const result = await userProfile.deleteMany({ _id: ids })
    if (result) {
        res.status(200).json({ message: "seleceted products are deleted" })
    }
    else {
        res.status(404).json({ message: "failed to delete products" })
    }

});



const port = 4000
app.listen(port, () => {
    console.log('server running', port)
})