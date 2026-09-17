const BASE_URL = "https://bookwise-three-omega.vercel.app";

const baseLayout = (title: string, content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0f19;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0b0f19;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#121826;border:1px solid #1e2638;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.4);">
          <!-- Header -->
          <tr>
            <td style="padding:24px 32px 20px;border-bottom:1px solid #1e2638;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:12px;">
                    <img src="${BASE_URL}/icons/logo.svg" alt="BookWise Logo" width="36" height="28" style="display:block;border:0;" />
                  </td>
                  <td style="vertical-align:middle;">
                    <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">BookWise</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px 32px 36px;">
              ${content}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const button = (href: string, label: string) => `
<table cellpadding="0" cellspacing="0" border="0" style="margin:16px 0 24px;">
  <tr>
    <td align="left" style="border-radius:6px;background-color:#e7c9a5;">
      <a href="${href}" target="_blank" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#16191e;text-decoration:none;border-radius:6px;background-color:#e7c9a5;">${label}</a>
    </td>
  </tr>
</table>`;

export const welcomeEmail = (fullName: string) =>
  baseLayout("Welcome to BookWise Email", `
    <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 20px;line-height:1.35;letter-spacing:-0.3px;">Welcome to BookWise, Your Reading Companion!</h1>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 16px;">Hi ${fullName},</p>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 20px;">Welcome to BookWise! We're excited to have you join our community of book enthusiasts. Explore a wide range of books, borrow with ease, and manage your reading journey seamlessly.</p>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 8px;">Get started by logging in to your account:</p>
    ${button(`${BASE_URL}/sign-in`, "Login to BookWise")}
    <p style="color:#cbd5e1;font-size:15px;line-height:1.6;margin:24px 0 0;">Happy reading,<br/>The BookWise Team</p>
  `);

export const approvalEmail = (fullName: string) =>
  baseLayout("Account Approval Email", `
    <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 20px;line-height:1.35;letter-spacing:-0.3px;">Your BookWise Account Has Been Approved!</h1>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 16px;">Hi ${fullName},</p>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 20px;">Congratulations! Your BookWise account has been approved. You can now browse our library, borrow books, and enjoy all the features of your new account.</p>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 8px;">Log in to get started:</p>
    ${button(`${BASE_URL}/sign-in`, "Log in to BookWise")}
    <p style="color:#cbd5e1;font-size:15px;line-height:1.6;margin:24px 0 0;">Welcome aboard,<br/>The BookWise Team</p>
  `);

export const rejectionEmail = (fullName: string) =>
  baseLayout("Account Rejection Email", `
    <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 20px;line-height:1.35;letter-spacing:-0.3px;">Your BookWise Account Was Not Approved</h1>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 16px;">Hi ${fullName},</p>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 20px;">Thank you for your interest in BookWise. Unfortunately, we were unable to approve your account at this time. This may be due to unsuccessful ID card verification.</p>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 8px;">If you believe this is an error, please contact our support team.</p>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.6;margin:24px 0 0;">Best regards,<br/>The BookWise Team</p>
  `);

export const borrowConfirmationEmail = (
  fullName: string,
  bookTitle: string,
  borrowDate: string,
  dueDate: string,
) =>
  baseLayout("Book Borrowed Confirmation Email", `
    <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 20px;line-height:1.35;letter-spacing:-0.3px;">You’ve Borrowed a Book!</h1>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 16px;">Hi ${fullName},</p>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 16px;">You’ve successfully borrowed <strong style="color:#ffffff;">${bookTitle}</strong>. Here are the details:</p>
    <ul style="color:#cbd5e1;font-size:15px;line-height:1.7;margin:0 0 20px;padding-left:20px;">
      <li style="margin-bottom:6px;">Borrowed On: <strong style="color:#e7c9a5;">${borrowDate}</strong></li>
      <li>Due Date: <strong style="color:#e7c9a5;">${dueDate}</strong></li>
    </ul>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 8px;">Enjoy your reading, and don’t forget to return the book on time!</p>
    ${button(`${BASE_URL}/my-profile`, "View Borrowed Books")}
    <p style="color:#cbd5e1;font-size:15px;line-height:1.6;margin:24px 0 0;">Happy reading,<br/>The BookWise Team</p>
  `);

export const receiptEmail = (
  fullName: string,
  bookTitle: string,
  arg3?: string,
  arg4?: string,
  borrowDate?: string,
  dueDate?: string,
  durationDays?: number,
) => {
  const actualBorrowDate = borrowDate || arg3 || "N/A";
  const actualDueDate = dueDate || arg4 || "N/A";

  return baseLayout("Book Receipt Generated Email", `
    <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 20px;line-height:1.35;letter-spacing:-0.3px;">Your Receipt for ${bookTitle} is Ready!</h1>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 16px;">Hi ${fullName},</p>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 16px;">Your receipt for borrowing <strong style="color:#ffffff;">${bookTitle}</strong> has been generated. Here are the details:</p>
    <ul style="color:#cbd5e1;font-size:15px;line-height:1.7;margin:0 0 20px;padding-left:20px;">
      <li style="margin-bottom:6px;">Borrowed On: <strong style="color:#e7c9a5;">${actualBorrowDate}</strong></li>
      <li>Due Date: <strong style="color:#e7c9a5;">${actualDueDate}</strong></li>
    </ul>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 8px;">You can download the receipt here:</p>
    ${button(`${BASE_URL}/my-profile`, "Download Receipt")}
    <p style="color:#cbd5e1;font-size:15px;line-height:1.6;margin:24px 0 0;">Keep the pages turning,<br/>The BookWise Team</p>
  `);
};

export const returnConfirmationEmail = (fullName: string, bookTitle: string) =>
  baseLayout("Book Return Confirmation Email", `
    <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 20px;line-height:1.35;letter-spacing:-0.3px;">Thank You for Returning ${bookTitle}!</h1>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 16px;">Hi ${fullName},</p>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 16px;">We’ve successfully received your return of <strong style="color:#ffffff;">${bookTitle}</strong>. Thank you for returning it on time.</p>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 8px;">Looking for your next read? Browse our collection and borrow your next favorite book!</p>
    ${button(`${BASE_URL}/`, "Explore New Books")}
    <p style="color:#cbd5e1;font-size:15px;line-height:1.6;margin:24px 0 0;">Happy exploring,<br/>The BookWise Team</p>
  `);

export const dueReminderEmail = (
  fullName: string,
  bookTitle: string,
  dueDate: string,
) =>
  baseLayout("Book Due Reminder Email", `
    <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 20px;line-height:1.35;letter-spacing:-0.3px;">Reminder: ${bookTitle} is Due Soon!</h1>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 16px;">Hi ${fullName},</p>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 20px;">Just a reminder that <strong style="color:#ffffff;">${bookTitle}</strong> is due for return on <strong style="color:#e7c9a5;">${dueDate}</strong>. Kindly return it on time to avoid late fees.</p>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 8px;">If you're still reading, you can renew the book in your account.</p>
    ${button(`${BASE_URL}/my-profile`, "Renew Book Now")}
    <p style="color:#cbd5e1;font-size:15px;line-height:1.6;margin:24px 0 0;">Keep reading,<br/>The BookWise Team</p>
  `);

export const inactivityEmail = (fullName: string) =>
  baseLayout("Inactivity Reminder (3+ Days)", `
    <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 20px;line-height:1.35;letter-spacing:-0.3px;">We Miss You at BookWise!</h1>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 16px;">Hi ${fullName},</p>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 20px;">It's been a while since we last saw you&mdash;over three days, to be exact! New books are waiting for you, and your next great read might just be a click away.</p>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 8px;">Come back and explore now:</p>
    ${button(`${BASE_URL}/`, "Explore Books on BookWise")}
    <p style="color:#cbd5e1;font-size:15px;line-height:1.6;margin:24px 0 0;">See you soon,<br/>The BookWise Team</p>
  `);

export const checkInReminderEmail = (fullName: string) =>
  baseLayout("Check-In Reminder Email", `
    <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 20px;line-height:1.35;letter-spacing:-0.3px;">Don't Forget to Check In at BookWise</h1>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 16px;">Hi ${fullName},</p>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 20px;">We noticed you haven't checked in recently. Stay active and keep track of your borrowed books, due dates, and new arrivals.</p>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 8px;">Log in now to stay on top of your reading:</p>
    ${button(`${BASE_URL}/sign-in`, "Log in to BookWise")}
    <p style="color:#cbd5e1;font-size:15px;line-height:1.6;margin:24px 0 0;">Keep the pages turning,<br/>The BookWise Team</p>
  `);

export const milestoneEmail = (fullName: string) =>
  baseLayout("Check-In Reminder Email - Congrats", `
    <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 20px;line-height:1.35;letter-spacing:-0.3px;">Congratulations on Reaching a New Milestone!</h1>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 16px;">Hi ${fullName},</p>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 20px;">Great news! You've reached a new milestone in your reading journey with BookWise. Whether it's finishing a challenging book, staying consistent with your reading goals, or exploring new genres, your dedication inspires us.</p>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 20px;">Keep the momentum going&mdash;there are more exciting books and features waiting for you!</p>
    <p style="color:#cbd5e1;font-size:15px;line-height:1.65;margin:0 0 8px;">Log in now to discover your next adventure:</p>
    ${button(`${BASE_URL}/`, "Discover New Reads")}
    <p style="color:#cbd5e1;font-size:15px;line-height:1.6;margin:24px 0 0;">Keep the pages turning,<br/>The BookWise Team</p>
  `);
