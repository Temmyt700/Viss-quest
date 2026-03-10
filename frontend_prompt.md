Build a modern responsive web application called VissQuest.

Tagline

Take Chances, Get Lucky, Win Big – VissQuest!

Frontend framework

React

The application is a prize draw platform with user dashboards, wallet system, daily spin, and daily quiz rewards.

Focus on frontend UI and component structure first.

No backend integration yet.

---

Design Style

Background: White

Primary gradient colors

#056608  
#147917  
#248D27  
#33A036  
#43B446  
#52C755

Design must be

Clean  
Modern  
Mobile-first  
Minimal

Buttons should be pill-shaped with soft shadows.

Cards should have subtle hover animation.

Use sleek, appealing cards with soft box shadows and good spacing.

---

Pages to Build

Home Page

Hero section

Display three active prize draws.

Each prize card includes

Prize image  
Prize title  
Entry fee  
Countdown timer  
Status message (Almost filled / Closing soon)  
Enter button

Important:
Do not show quiz before entering a draw.

When user clicks Enter Draw, open an entry/payment flow directly.

---

Login Page

Fields

Email  
Password

---

Signup Page

Fields

Full name  
Email  
WhatsApp phone number  
Password

Add helper text telling users that their WhatsApp number is important because winners will be contacted through it.

---

User Dashboard

Display

Reference ID  
Wallet balance  
Participations  
Wins

Quick action buttons

Fund Wallet  
Daily Spin  
Daily Quiz

Also show recent entries and simple stats cards.

---

Wallet Page

Display wallet balance clearly.

Buttons

Fund Wallet

Show funding instructions section with:

Bank name  
Account number  
Account name

Show note that the user must include their Reference ID in the bank transfer narration.

Include a transaction history table.

---

Enter Draw Modal or Page

When user clicks Enter Draw, show:

Prize name  
Entry fee  
Current wallet balance  
Confirm Entry button

If wallet balance is too low, show a prompt to fund wallet.

No quiz should appear here.

---

Daily Spin Page

Spin wheel UI

Spin cost

₦15

Show a clean spin wheel or reward card interface.

After spinning, show a result modal.

Possible sample rewards

₦1000  
₦500  
₦100  
Free Entry  
Try Again

Also show a note that users can only spin once per day.

---

Daily Quiz Page

This is separate from prize draw entry.

Users come here daily to answer one quiz question and earn small cash rewards.

UI should include

Question card  
3 or 4 answer options  
Submit answer button  
Result state

If answer is correct, show reward message such as:

You earned ₦50  
You earned ₦100

If answer is wrong, show a gentle retry tomorrow message.

Also show a small section for:

Today’s quiz status  
Reward earned today

---

Winners Page

Display winner cards.

Each card shows

Prize image  
Winner reference ID  
Date won  
Prize title

---

Admin Panel

Route

/admin

Sidebar navigation

Dashboard  
Create Draw  
Participants  
Wallet Deposits  
Winners  
Daily Quiz

Admin can

Create draws  
Approve wallet deposits  
View entries  
View winners  
Create daily quiz questions

---

Component Structure

components

Navbar  
PrizeCard  
Timer  
WalletCard  
SpinWheel  
WinnerCard  
StatsCard  
AdminSidebar  
AdminTable  
QuizCard  
EntryModal

pages

Home  
Login  
Signup  
Dashboard  
Wallet  
Spin  
DailyQuiz  
Winners  
AdminDashboard  
AdminCreateDraw  
AdminDeposits  
AdminWinners  
AdminQuiz

---

UI Requirements

Use reusable React components and clean folder structure.

The design should feel like a modern startup product.

Use a white background with strong green gradient accents.

Buttons should be pill-shaped and attractive.

Cards should feel premium with smooth hover effects and soft shadows.

Use mobile-first responsive layouts because most users will come from WhatsApp.

---

Important Product Rules

Do not show number of participants publicly.

Instead show status messages like:

Almost Filled  
Closing Soon  
Limited Slots Remaining

Do not show quiz before prize draw entry.

Daily Quiz must be a separate feature where users answer questions to earn small wallet rewards.

The interface should prioritize simplicity, trust, and smooth navigation.