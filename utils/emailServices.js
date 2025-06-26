import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (
  to,
  status,
  orderId,
  products = [],
  paymentType = 'Online',
  discountAmount = 0,
  couponCode = ''
) => {
  const total = products
    .reduce((sum, p) => sum + (Number(p.price) * Number(p.quantity || 1)), 0)
    .toFixed(2);

  const finalTotal = (total);

  const productRows = products
    .map((p) => {
      const qty = Number(p.quantity || 1);
      const price = Number(p.price).toFixed(2);
      const subtotal = (qty * Number(p.price)).toFixed(2);
      return `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 10px; width: 100px;">
            <img src="${p.image}" alt="${p.name}" style="width: 100px; border-radius: 6px;" />
          </td>
          <td style="padding: 10px; vertical-align: top;">
            <strong style="font-size: 16px;">${p.name}</strong><br/>
            <span style="color: #555;">Qty:</span> ${qty}<br/>
            <span style="color: #555;">Price:</span> ₹${price}<br/>
            <span style="color: #555;">Subtotal:</span> ₹${subtotal}<br/>
            <span style="color: #555;">Status:</span> <span style="color: #28a745;">${p.status}</span>
          </td>
        </tr>
      `;
    })
    .join('');

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: auto; border: 1px solid #ccc; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
       <div style="font-weight: bold; font-size: 24px; color: #333; text-align: center; margin-bottom: 10px;">
  Apni Choice
</div>
        <h2 style="color: #333; margin: 10px 0;">Order #${orderId} Update</h2>
        <p style="font-size: 16px;">Your order status is now: <strong style="color: #007bff;">${status}</strong></p>
      </div>
      <div style="padding: 20px;">
        <h3 style="margin-bottom: 10px; color: #444;">🛒 Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${productRows}
        </table>
        <div style="margin-top: 20px; font-size: 16px; text-align: right;">
          ${couponCode ? `<p><strong>Coupon Applied:</strong> ${couponCode}</p>` : ''}
          ${discountAmount > 0 ? `<p><strong>Discount:</strong> -₹${Number(discountAmount).toFixed(2)}</p>` : ''}
          <p><strong>Payment Method:</strong> ${paymentType === 'cash on delivery' ? 'COD' : 'Online'}</p>
          <p><strong>Final Total:</strong> ₹${finalTotal}</p>
        </div>
      </div>
      <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #666;">
        Thank you for shopping with us!
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"Apni Choice" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Order #${orderId} Status: ${status}`,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent to:', to);
  } catch (err) {
    console.error('❌ Email failed:', err);
  }
};

export default sendEmail;
