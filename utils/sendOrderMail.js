const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  service: "gmail",
  // host: 'google',
  port: 465,
  secure: true,
  auth: {
    user: process.env.NAZDIK_WALA_MAIL,
    pass: process.env.NAZDIK_WALA_MAIL_PASS,
  },
});

exports.orderMailTo = async (data) => {
  let {  totalOrders, user, admin, } = data;
  var mailOptions = {
    from: process.env.NAZDIK_WALA_MAIL,
    to: admin.email,
    subject: "new Order",
    html: `
      <div style="font-family: Verdana, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <h2 style="color: #333;">Got a New Order</h2>
        <p>You Got ${totalOrders} New Orders From : :</p>
        <ul>
          <li><strong>Email:</strong> ${user.email}</li>
          <li><strong> Name:</strong> ${user.fullName}</li>
          <li><strong>Mobile:</strong> ${user.mobileNumber}</li>


        </ul>
        <div>
        <p>

        </div>
       
       
      </div>
    `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
