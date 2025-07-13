const nodemailer = require('nodemailer');
const path = require('path');

const sendEmail = async (to, subject, html, attachments = null) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Nếu không truyền attachments, gán logo mặc định
        if (!attachments) {
            attachments = [
                {
                    filename: 'favicon.png',
                    path: path.join(__dirname, '../uploads/assets/favicon.png'),
                    cid: 'logo_cid', // phải khớp với src="cid:logo_cid" trong HTML
                },
            ];
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html,
            attachments,
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Email sent to:', to);
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw new Error('Gửi email thất bại');
    }
};

module.exports = sendEmail;
