import apper from 'https://cdn.apper.io/actions/apper-actions.js';

const handler = async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Method not allowed. Use POST.' 
        }),
        { 
          status: 405, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON in request body' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate required fields
    const { 
      recipientEmail, 
      notificationType, 
      title, 
      message, 
      targetType, 
      targetId,
      metadata = {}
    } = body;

    if (!recipientEmail || !notificationType || !title || !message) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: recipientEmail, notificationType, title, message' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid email format' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get email service API key
    let apiKey;
    try {
      apiKey = await apper.getSecret('RESEND_API_KEY');
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email service not configured. Please add RESEND_API_KEY secret.' 
        }),
        { 
          status: 503, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email service API key not found' 
        }),
        { 
          status: 503, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate email content based on notification type
    const emailContent = generateEmailContent(notificationType, {
      title,
      message,
      targetType,
      targetId,
      metadata
    });

    // Prepare email data for Resend API
    const emailData = {
      from: 'HiveBoard <notifications@your-domain.com>',
      to: [recipientEmail],
      subject: emailContent.subject,
      html: emailContent.html
    };

    // Send email using Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Email service error: ${emailResult.message || 'Unknown error'}` 
        }),
        { 
          status: 502, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email notification sent successfully',
        emailId: emailResult.id
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Server error: ${error.message}` 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
};

function generateEmailContent(notificationType, data) {
  const { title, message, targetType, targetId, metadata } = data;
  
  const baseStyles = `
    <style>
      body { font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; color: #1a202c; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
      .content { background: white; padding: 20px; border: 1px solid #e2e8f0; }
      .footer { background: #f8fafc; padding: 15px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; font-size: 12px; color: #64748b; }
      .btn { display: inline-block; padding: 10px 20px; background: #6366F1; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      .notification-type { background: #eff6ff; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
    </style>
  `;

  const getNotificationTypeDisplay = (type) => {
    const typeMap = {
      reply: 'Reply',
      mention: 'Mention',
      award: 'Award Received',
      mod_invite: 'Moderator Invitation',
      ban: 'Account Action',
      content_removed: 'Content Moderation',
      upvote_post: 'Post Upvote',
      upvote_comment: 'Comment Upvote',
      new_follower: 'New Follower',
      message: 'New Message'
    };
    return typeMap[type] || 'Notification';
  };

  const getActionUrl = (targetType, targetId) => {
    const baseUrl = 'https://your-app-domain.com';
    switch (targetType) {
      case 'post':
        return `${baseUrl}/post/${targetId}`;
      case 'comment':
        return `${baseUrl}/post/${targetId}`;
      case 'user':
        return `${baseUrl}/profile/${targetId}`;
      case 'community':
        return `${baseUrl}/r/${targetId}`;
      default:
        return `${baseUrl}/notifications`;
    }
  };

  const actionUrl = getActionUrl(targetType, targetId);
  const typeDisplay = getNotificationTypeDisplay(notificationType);

  const subject = `HiveBoard: ${typeDisplay} - ${title}`;
  
  const html = `
    ${baseStyles}
    <div class="container">
      <div class="header">
        <h1 style="margin: 0; font-size: 24px;">HiveBoard</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">You have a new notification</p>
      </div>
      
      <div class="content">
        <div style="margin-bottom: 15px;">
          <span class="notification-type">${typeDisplay}</span>
        </div>
        
        <h2 style="color: #1a202c; margin: 0 0 10px 0; font-size: 18px;">${title}</h2>
        
        <div style="color: #4a5568; margin-bottom: 20px; padding: 15px; background: #f8fafc; border-left: 4px solid #6366F1; border-radius: 4px;">
          ${message}
        </div>
        
        ${metadata.community ? `
          <p style="margin: 10px 0; color: #64748b; font-size: 14px;">
            📍 In r/${metadata.community}
          </p>
        ` : ''}
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="${actionUrl}" class="btn">View on HiveBoard</a>
        </div>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #64748b;">
          <p><strong>Want to manage your notification preferences?</strong></p>
          <p><a href="https://your-app-domain.com/preferences/notifications" style="color: #6366F1;">Update your notification settings</a></p>
        </div>
      </div>
      
      <div class="footer">
        <p>This email was sent by HiveBoard. If you don't want to receive these emails, you can <a href="https://your-app-domain.com/preferences/notifications">update your preferences</a> or <a href="https://your-app-domain.com/unsubscribe">unsubscribe</a>.</p>
        <p>© 2024 HiveBoard. All rights reserved.</p>
      </div>
    </div>
  `;

  return { subject, html };
}

export default apper.serve(handler);