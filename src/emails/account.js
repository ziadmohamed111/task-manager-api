const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'zeyadzaher02@gmail.com',
        subject: 'Thanks for Joining in!',
        text: `Welcom to the app, ${name}. Let me know how you got along with the app `
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'zeyadzaher02@gmail.com',
        subject: 'Sorry to see you go!',
        text: `Goodbye, ${name}. I hope to see you back sometime soon.`
    })
}
module.exports = {
    sendWelcomEmail,
    sendCancelationEmail
}