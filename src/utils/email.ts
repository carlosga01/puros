import { Resend } from 'resend';

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static instance: EmailService;
  private resend: Resend;

  private constructor() {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(template: EmailTemplate): Promise<boolean> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
        to: template.to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      if (error) {
        console.error('Email send error:', error);
        return false;
      }

      console.log('Email sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }

  // Follow notification email
  async sendFollowNotification(followerName: string, recipientEmail: string): Promise<boolean> {
    const template: EmailTemplate = {
      to: recipientEmail,
      subject: `${followerName} started following you on Puros!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>New Follower</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              margin: 0; 
              padding: 0; 
              background-color: #0a0a0f;
              color: #ffffff;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
              background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
              border-radius: 12px;
              margin-top: 20px;
            }
            .header { 
              text-align: center; 
              padding: 20px 0; 
              border-bottom: 2px solid rgba(255, 193, 68, 0.3);
              margin-bottom: 30px;
            }
            .header h1 { 
              color: #ffc144; 
              margin: 0; 
              font-size: 28px;
              background: linear-gradient(135deg, #ffffff 0%, #ffc144 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            .content { 
              padding: 20px 0; 
              text-align: center;
            }
            .follower-name {
              color: #ffc144;
              font-weight: bold;
              font-size: 18px;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #ffc144 0%, #ff9a00 100%);
              color: #000000 !important;
              text-decoration: none;
              padding: 12px 30px;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
              transition: transform 0.2s ease;
            }
            .footer {
              text-align: center;
              padding-top: 30px;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
              color: rgba(255, 255, 255, 0.6);
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 Puros</h1>
            </div>
            <div class="content">
              <h2 style="color: rgba(255, 255, 255, 0.9); margin-bottom: 20px;">
                You have a new follower!
              </h2>
              <p style="font-size: 16px; margin-bottom: 25px; color: rgba(255, 255, 255, 0.8);">
                <span class="follower-name">${followerName}</span> started following you on Puros. 
                They'll now see your cigar reviews in their feed!
              </p>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/home" class="cta-button">
                View Your Profile
              </a>
              <p style="color: rgba(255, 255, 255, 0.6); margin-top: 25px; font-size: 14px;">
                Keep sharing your cigar experiences to engage with your growing community of followers.
              </p>
            </div>
            <div class="footer">
              <p>Thank you for being part of the Puros community!</p>
              <p>Happy smoking! 💨</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `${followerName} started following you on Puros! They'll now see your cigar reviews in their feed. Visit ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/home to view your profile.`
    };

    return this.sendEmail(template);
  }

  // New post notification email for followers
  async sendNewPostNotification(
    authorName: string,
    cigarName: string,
    rating: number,
    recipientEmail: string,
    postUrl?: string
  ): Promise<boolean> {
    const stars = '⭐'.repeat(rating);
    
    const template: EmailTemplate = {
      to: recipientEmail,
      subject: `${authorName} reviewed ${cigarName} on Puros!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>New Review</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              margin: 0; 
              padding: 0; 
              background-color: #0a0a0f;
              color: #ffffff;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
              background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
              border-radius: 12px;
              margin-top: 20px;
            }
            .header { 
              text-align: center; 
              padding: 20px 0; 
              border-bottom: 2px solid rgba(255, 193, 68, 0.3);
              margin-bottom: 30px;
            }
            .header h1 { 
              color: #ffc144; 
              margin: 0; 
              font-size: 28px;
              background: linear-gradient(135deg, #ffffff 0%, #ffc144 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            .content { 
              padding: 20px 0; 
              text-align: center;
            }
            .author-name {
              color: #ffc144;
              font-weight: bold;
              font-size: 18px;
            }
            .cigar-name {
              color: rgba(255, 255, 255, 0.95);
              font-weight: bold;
              font-size: 20px;
              margin: 10px 0;
            }
            .rating {
              font-size: 24px;
              margin: 15px 0;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #ffc144 0%, #ff9a00 100%);
              color: #000000 !important;
              text-decoration: none;
              padding: 12px 30px;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
              transition: transform 0.2s ease;
            }
            .footer {
              text-align: center;
              padding-top: 30px;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
              color: rgba(255, 255, 255, 0.6);
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 Puros</h1>
            </div>
            <div class="content">
              <h2 style="color: rgba(255, 255, 255, 0.9); margin-bottom: 20px;">
                New Review from Someone You Follow!
              </h2>
              <p style="font-size: 16px; margin-bottom: 15px; color: rgba(255, 255, 255, 0.8);">
                <span class="author-name">${authorName}</span> just reviewed:
              </p>
              <div class="cigar-name">${cigarName}</div>
              <div class="rating">${stars} (${rating}/5)</div>
              <a href="${postUrl || (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000') + '/home'}" class="cta-button">
                Read Full Review
              </a>
              <p style="color: rgba(255, 255, 255, 0.6); margin-top: 25px; font-size: 14px;">
                Discover what ${authorName} thought about this cigar and explore more reviews from the community.
              </p>
            </div>
            <div class="footer">
              <p>Thank you for being part of the Puros community!</p>
              <p>Happy smoking! 💨</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `${authorName} just reviewed ${cigarName} and gave it ${rating}/5 stars! Visit ${postUrl || (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000') + '/home'} to read the full review.`
    };

    return this.sendEmail(template);
  }

  // Batch send emails to multiple recipients
  async sendBatchEmails(templates: EmailTemplate[]): Promise<boolean[]> {
    const results = await Promise.allSettled(
      templates.map(template => this.sendEmail(template))
    );

    return results.map(result => 
      result.status === 'fulfilled' ? result.value : false
    );
  }
}

export default EmailService;
