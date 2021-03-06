var Config = require('../Config'),
    Nodemailer = require('nodemailer'),
    Path = require('path'),
    TemplatesDir = Path.resolve(__dirname, '..', 'views/mailer'),
    EmailTemplates = require('email-templates'),
    EmailAddressRequiredError = new Error('email address required');

// create a defaultTransport using gmail and authentication that are
// storeed in the `Config.js` file.
var DefaultTransport = Nodemailer.createTransport('SMTP', {
 service: 'Gmail',
 auth: {
   user: Config.mailer.auth.user,
   pass: Config.mailer.auth.pass
 }
});

exports.sendOne = function (templateName, locals, fn) {
 // make sure that we have an user email
 if (!locals.email) {
   return fn(EmailAddressRequiredError);
 }
 // make sure that we have a message
 if (!locals.subject) {
   return fn(EmailAddressRequiredError);
 }
 EmailTemplates(TemplatesDir, function (err, template) {
   if (err) {
     //console.log(err);
     return fn(err);
   }
   // Send a single email
   template(templateName, locals, function (err, html, text) {
     if (err) {
       //console.log(err);
       return fn(err);
     }
     // if we are testing don't send out an email instead return
     // success and the html and txt strings for inspection
     if (process.env.NODE_ENV === 'test') {
       return fn(null, '250 2.0.0 OK 1350452502 s5sm19782310obo.10', html, text);
     }
     var transport = DefaultTransport;
     transport.sendMail({
       from: Config.mailer.defaultFromAddress,
       to: locals.email,
       subject: locals.subject,
       html: html,
       // generateTextFromHTML: true,
       text: text
     }, function (err, responseStatus) {
       if (err) {
         return fn(err);
       }
       return fn(null, responseStatus.message, html, text);
     });
   });
 });
}