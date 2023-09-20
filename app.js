const express = require("express")

const app = express()


const session = require("express-session")

const FileStore = require("session-file-store")(session)

const PORT = process.env.PORT || 3000

const passport = require("passport")

// const localStrategy = require("passport-local")
const { clientId, clientSecret } = require("./config/config")

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.set("view engine", "ejs")

app.use(session({
    resave: false,
    secret: "secret",
    saveUninitialized: true,
    store: new FileStore(),
    cookie: {
        secure: false
    }
}))
const strategy = require("passport-outlook").Strategy

const OutlookStrategy = new strategy({
    clientID: clientId,
    clientSecret: clientSecret,
    callbackURL: "http://localhost:3000/redirect/",
}, (accessToken, refreshToken, profile, done) => {
    done(null, profile)
})

// const strategy = new localStrategy((username, password, done) => {
//     done(null, { username, password })
// })

passport.use("outlook", OutlookStrategy)

passport.serializeUser((profile, done) => {
    return done(null, profile)
})

passport.deserializeUser((profile, done) => {
    return done(null, profile)
})

app.get('/', (req, res) => {
    res.render("index")
})

app.get('/logout', (req, res) => {
    req.session.destroy(function () {
        res.render("logout")
    })
})

app.get('/outlook/auth', passport.authenticate("outlook", {
    scope: ['openid',
        'profile',
        'offline_access',
        'https://outlook.office.com/Mail.Read']
}))

app.get('/redirect', passport.authenticate("outlook", { failureRedirect: "/" }), (req, res) => {
    res.redirect("/auth/success")
})

app.get("/auth/success", (req, res) => {
    console.log(req.user)
    res.status(200).render("success")
})

app.listen(PORT, () => console.log("server running on port " + PORT))