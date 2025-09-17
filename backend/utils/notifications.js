import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Send general email
export const sendEmail = async (to, subject, content, isHtml = false) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'Car Service Center <no-reply@carservice.com>',
      to,
      subject,
      ...(isHtml ? { html: content } : { text: content })
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Send booking confirmation email
export const sendBookingEmail = async (to, bookingDetails) => {
  try {
    // Format date for display
    const formattedDate = new Date(bookingDetails.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Car Service Center" <no-reply@carservice.com>',
      to,
      subject: 'Your Service Appointment Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Appointment Confirmation</h2>
          <p>Hello ${bookingDetails.name || 'Valued Customer'},</p>
          <p>Your appointment has been successfully scheduled. Here are the details:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Service:</strong> ${bookingDetails.service}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${bookingDetails.time}</p>
            <p><strong>Vehicle:</strong> ${bookingDetails.vehicleDetails}</p>
            <p><strong>Booking Reference:</strong> ${bookingDetails.bookingRef || 'N/A'}</p>
            <p><strong>Status:</strong> ${bookingDetails.status}</p>
          </div>
          
          <p>If you need to make any changes to your appointment, please contact us at least 24 hours in advance.</p>
          <p>Thank you for choosing our service!</p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #777; font-size: 12px;">${new Date().getFullYear()} Car Service Center. All rights reserved.</p>
          </div>
        </div>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    // Don't throw error to prevent blocking the appointment creation process
    return null;
  }
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (to, orderDetails) => {
  try {
    // Format date for display
    const formattedDate = new Date(orderDetails.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Generate items HTML
    const itemsHtml = orderDetails.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.serviceName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Car Service Center" <no-reply@carservice.com>',
      to,
      subject: 'Your Order Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Order Confirmation</h2>
          <p>Thank you for your order!</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
          </div>
          
          <h3>Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                <td style="padding: 10px; text-align: right; font-weight: bold;">$${orderDetails.totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          <p style="margin-top: 20px;">If you have any questions about your order, please contact our customer service.</p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #777; font-size: 12px;">${new Date().getFullYear()} Car Service Center. All rights reserved.</p>
          </div>
        </div>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    // Don't throw error to prevent blocking the order creation process
    return null;
  }
};
