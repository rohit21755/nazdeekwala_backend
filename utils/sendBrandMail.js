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


exports.mailTo = async (data) => {
  let { email, body, admin, html } = data;
  var mailOptions = {
    from: admin.email, //process.env.NAZDIK_WALA_MAIL,
    to: process.env.NAZDIK_WALA_MAIL,
    subject: "Brand Creation Request",
    html: `
    <html>
    <head>
      <style>
        * {
          font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS",
            sans-serif;
        }
  
        h2 {
          color: #333;
        }
  
        div.mainContainer {
          padding: 10px 25px 25px 25px !important;
          background-color: #f4f4f4;
          border-radius: 10px;
        }
  
        .brand-image {
          height: 150px;
          width: 150px;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 15px;
        }
  
        .brand-image img {
          object-fit: contain;
          height: 100%;
          width: 100%;
        }
  
        .approve-link {
          margin-top: 25px;
        }
  
        .approve-link a {
          background: #1a4a60;
          color: white;
          padding: 7px 12px;
          border-radius: 7px;
        }
      </style>
    </head>
    <body>
      <div class="mainContainer">
        <h2>Brand Creation Request</h2>
        <p>Please create the following brand:</p>
        <ul>
          <li><strong>Brand Name:</strong> ${body?.brandName}</li>
          <li><strong>Email:</strong> ${admin.email}</li>
          <li><strong>Seller Name:</strong> ${admin.fullName}</li>
          <li><strong>Mobile:</strong> ${admin.mobileNumber}</li>
        </ul>
        <p>Attached Brand Image:</p>
        <div class="brand-image">
          <img
            alt="${body?.brandName}"
            src="${body?.image}"
          />
        </div>
        <div class="approve-link">
          <a href="https://admin.nazdikwala.com/admin/brands?brandName=${body?.brandName}&brandImage=${body?.image}">Approve Brand</a>
        </div>
      </div>
    </body>
  </html>
  
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
