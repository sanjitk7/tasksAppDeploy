const sgMail = require("@sendgrid/mail")

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const welcomeEmail = (email,name) => {
    sgMail.send({
        to: email,
        from: "sanjitcks@gmail.com",
        subject: "Welcome to Task Manger App",
        text: `Welcome to the family, ${name}. Let us know how it works.`
    })
}

const goodbyeEmail = (email,name) => {
    sgMail.send({
        to: email,
        from: "sanjitcks@gmail.com",
        subject: "Goodbye! Task Manager App",
        text: `Goodbye ${name}. We are sorry to see you leave. Is there anything that we could have done to make you stay? Reply to this mail and let us know.`
    })
}

module.exports = {
    welcomeEmail,
    goodbyeEmail
}