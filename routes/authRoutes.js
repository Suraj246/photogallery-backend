const { register, login } = require("../controllers/authControllers");
const { checkUser } = require("../middlewares/authMiddleware");
const userProfile = require("../model/imageModel");
// const userProfile = require("../model/authModel");
const User = require("../model/authModel");
const jwt = require("jsonwebtoken");
const router = require("express").Router();

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, "kishan sheth super secret key", {
        expiresIn: maxAge,
    });
};

router.post("/", checkUser);
// router.post("/register", register);
// router.post("/login", login);
const handleErrors = (err) => {
    let errors = { email: "", password: "" };

    console.log(err);

    if (err.message === "incorrect email") {
        errors.email = "That email is not registered";
    }

    if (err.message === "incorrect password") {
        errors.password = "That password is incorrect";
    }

    if (err.code === 11000) {
        errors.email = "Email is already registered";
        return errors;
    }

    if (err.message.includes("Users validation failed")) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }

    return errors;
};
router.route("/register").post(async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber, email, password } = req.body;
        if (!firstName || !lastName || !phoneNumber || !email || !password) {
            return res.status(422).json({ errors: "fill form correctly" })
        }
        const userExit = await User.findOne({ email: email })
        if (userExit) {
            return res.status(409).json({ errors: "user already exists" })
        }
        const user = new User({ firstName, lastName, phoneNumber, email, password });
        const userCreated = await user.save();
        if (userCreated) {
            res.status(201).json({ user: user._id, created: true });
        }

    } catch (err) {
        console.log(err);
        const errors = handleErrors(err);
        res.json({ errors: "registratin failed", errors, created: false });
    }

})
router.route("/login").post(async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: false, maxAge: maxAge * 1000 });
        res.status(200).json({ user: user._id, status: true });
    } catch (err) {
        const errors = handleErrors(err);
        res.json({ errors: "login failed", errors, status: false });
    }
})

// router.route("/delete/:id").delete(async (req, res) => {
//     console.log("req", req.params._id)
//     await userProfile.findByIdAndDelete({ _id: req.params.id })
//         .then((res) => {
//             console.log(res);
//         })
//         .catch((err) => {
//             console.log(err);
//         });
// });


module.exports = router;