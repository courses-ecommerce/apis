// main.js
const nodemailer = require('nodemailer');

// configure option
const option = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.NODE_MAIL_USER,
    pass: process.env.NODE_MAIL_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(option);

// send email
const sendEmail = async ({ to, subject, text, html, ...rest }) => {
  try {
    const res = await transporter.verify();
    if (res) {
      //config mail
      const mail = {
        //sender access
        from: '"Hoàng Toeic" <no-reply@accounts.ht.com>',
        //receiver access
        to,
        //subject
        subject,
        //content text
        text,
        //html
        html,
        //others
        ...rest,
      };
      //Tiến hành gửi email
      const info = await transporter.sendMail(mail);
      if (info) {
        return true;
      }
    }
  } catch (err) {
    console.error('ERROR MAILER: ', err);
    return false;
  }
};

const headerHtmlMail = `<h1 style="color: #4c649b; font-size: 48px; border-bottom: solid 2px #ccc;padding-bottom: 10px">
GENY Courses Eccommerce <br />
    </h1>`;
const footerHtmlVerifyMail = `<h1>Cảm ơn./.</h1>`;

// gửi mã xác nhận
const htmlSignupAccount = (token) => {
  return `<div>
    ${headerHtmlMail}
    <h2 style="padding: 10px 0; margin-bottom: 10px;">
        Xin chào,<br />
        Mã xác nhận đăng ký tài khoản cho website GENY Courses Eccommerce của bạn.<br />
    </h2>
    <h3 style="background: #eee;padding: 10px;">
      <i><b>${token}</b></i>
    </h3>
    <h3 style="color: red">
        Chú ý: Không đưa mã này cho bất kỳ ai,
        có thể dẫn đến mất tài khoản.<br />
        Mã chỉ có hiệu lực <i>10 phút </i> từ khi bạn nhận được mail.
    </h3>
  ${footerHtmlVerifyMail}
  </div>`;
};

// gửi mã đổi mật khẩu
const htmlResetPassword = (token) => {
  return `<div>
    ${headerHtmlMail}
    <h2 style="padding: 10px 0; margin-bottom: 10px;">
        Xin chào,<br />
        GENY Courses Eccommerce đã nhận được yêu cầu lấy lại mật khẩu từ bạn.<br />
        Đừng lo lắng, hãy nhập mã này để khôi phục:
    </h2>
    <h1 style="background: #eee;padding: 10px;">
      <i><b>${token}</b></i>
    </h1>
    <h3 style="color: red">
        Chú ý: Không đưa mã này cho bất kỳ ai,
        có thể dẫn đến mất tài khoản.<br />
        Mã chỉ có hiệu lực <i>10 phút </i> từ khi bạn nhận được mail.
    </h3>
    ${footerHtmlVerifyMail}
  </div>`;
};

// gửi thông báo đăng nhập sai quá nhiều
const htmlWarningLogin = () => {
  return `<div>
   ${headerHtmlMail}
    <h2 style="padding: 10px 0; margin-bottom: 10px;">
        Xin Chào anh (chị),<br />
        Cửa hàng nghi ngờ có ai đó đã cố gắng đăng nhập vào tài khoản của quý khách.<br />
        Nếu quý khác không nhớ mật khẩu hãy nhấn vào "Quên mật khẩu" để lấy lại mật khẩu<br/>
    </h2>
    <h1>Cảm ơn.</h1>
  </div>`;
};

// gửi mã đổi mật khẩu
const htmlInvoices = (invoice) => {
  return `<div>
  <div
    style="display: flex;flex-direction: row;justify-content: space-between;align-items: center;border-bottom: 1px solid rgb(194, 193, 193);">
    <h3>GENY COURSE ECOMMERCE</h3>
    <span>${invoice.createdAt}</span>
  </div>
  <div style="display: flex;flex-direction: row;justify-content: space-between;padding-bottom: 20px;border-bottom: 1px
    solid rgb(194, 193, 193);">
    <div style="display: flex;flex: 1;flex-direction: column;gap: 20px;">
      <h3 style=" text-align: center;text-transform: uppercase;font-size: 24px;">Hoá đơn #${invoice._id}</h3>
      <span><b>Kính gửi:</b>${invoice.user.fullName}</span>
      <span><b>Phương thức thanh toán:</b>${invoice.paymentMethod}</span>
      <span><b>Tổng số tiền ước tính:</b>${invoice.paymentPrice} vnđ</span>
      <span><b>Giảm giá:</b>${invoice.totalDiscount} vnđ</span>
      <span><b>Thanh toán:</b>${invoice.paymentPrice} vnđ</span>
    </div>
    <div>
      <img style=" height: 150px;width: 150px;" src="${invoice._id}"
        alt="qr_code" />
    </div>
  </div>
  <div stype=" margin-top: 20px;width: 100%;">
    <table style="width: 100%;">
      <tr>
        <th colspan="4">Thông tin chi tiết hoá đơn</th>
      </tr>
      <tr>
        <th style=" border: 1px solid rgb(214, 212, 212);padding: 10px;">Tên khoá học</th>
        <th style=" border: 1px solid rgb(214, 212, 212);padding: 10px;">Giá</th>
        <th style=" border: 1px solid rgb(214, 212, 212);padding: 10px;">Giảm giá</th>
        <th style=" border: 1px solid rgb(214, 212, 212);padding: 10px;">Tạm tính</th>
      </tr>
      <tr>
        <td style=" border: 1px solid rgb(214, 212, 212);padding: 10px;">ABC</td>
        <td style=" border: 1px solid rgb(214, 212, 212);padding: 10px;">15</td>
        <td style=" border: 1px solid rgb(214, 212, 212);padding: 10px;">7</td>
        <td style=" border: 1px solid rgb(214, 212, 212);padding: 10px;">8</td>
      </tr>
    </table>
  </div>
</div>`
};

module.exports = {
  sendEmail,
  htmlSignupAccount,
  htmlResetPassword,
  htmlWarningLogin,
  htmlInvoices,
};
