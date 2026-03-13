# VissQuest Database Schema

Database: PostgreSQL

Tables

users  
wallets  
wallet_transactions  
draws  
entries  
winners  
spin_rewards  
spin_history  
daily_quizzes  
quiz_attempts

---

# users

Stores all registered users.

Columns

id (UUID, Primary Key)

reference_id (VARCHAR, UNIQUE)

name (VARCHAR)

email (VARCHAR, UNIQUE)

phone (VARCHAR)

password_hash (VARCHAR)

created_at (TIMESTAMP)

Example

reference_id: VQ024

Notes

reference_id is the public ID shown on the platform instead of the user's real name.

phone should be the user's active WhatsApp number.

---

# wallets

Each user has one wallet.

Columns

id (UUID, Primary Key)

user_id (UUID, Foreign Key -> users.id, UNIQUE)

balance (NUMERIC)

created_at (TIMESTAMP)

Notes

One wallet per user.

balance should default to 0.

---

# wallet_transactions

Tracks every wallet-related activity.

Columns

id (UUID, Primary Key)

user_id (UUID, Foreign Key -> users.id)

type (VARCHAR)

amount (NUMERIC)

status (VARCHAR)

reference (VARCHAR)

description (TEXT)

created_at (TIMESTAMP)

Transaction Types

deposit  
entry_fee  
spin_fee  
spin_reward  
quiz_reward  
admin_adjustment

Statuses

pending  
approved  
rejected  
completed

Examples

deposit → user funds wallet manually  
entry_fee → wallet deducted for draw entry  
spin_fee → wallet deducted for daily spin  
spin_reward → wallet credited after spin win  
quiz_reward → wallet credited after correct quiz answer

---

# draws

Stores prize draw events.

Columns

id (UUID, Primary Key)

draw_id (VARCHAR, UNIQUE)

title (VARCHAR)

description (TEXT)

entry_fee (NUMERIC)

prize_value (NUMERIC)

prize_type (VARCHAR)

image_url (TEXT)

max_entries (INTEGER)

current_entries (INTEGER)

draw_day (VARCHAR)

start_time (TIMESTAMP)

end_time (TIMESTAMP)

status (VARCHAR)

created_at (TIMESTAMP)

Status Values

available  
almost_filled  
closing_soon  
limited_slots  
filled  
closed  

Notes

draw_id is the public/admin identifier for the draw.

current_entries should default to 0.

When current_entries reaches max_entries, status should automatically become filled.

When end_time is reached, status should automatically become closed.

Admin can manually override urgency status when needed.

Prize Type Examples

cash  
gadget  
appliance  
fashion  
other

Example

title: Samsung 55 Inch TV  
entry_fee: 1000  
prize_value: 350000  
prize_type: appliance

Notes

Draws happen only on Monday, Wednesday, and Friday.

Each draw can have a hidden max_entries limit.

---

# entries

Records each user entry into a draw.

Columns

id (UUID, Primary Key)

user_id (UUID, Foreign Key -> users.id)

draw_id (UUID, Foreign Key -> draws.id)

entry_fee (NUMERIC)

created_at (TIMESTAMP)

Notes

Created when a user enters a draw and the wallet is successfully deducted.

If you later want to allow multiple entries per user into the same draw, keep this table as-is.

If you want only one entry per user per draw, add a unique constraint on user_id + draw_id.

---

# winners

Stores draw winners.

Columns

id (UUID, Primary Key)

draw_id (UUID, Foreign Key -> draws.id)

user_id (UUID, Foreign Key -> users.id)

reference_id (VARCHAR)

prize_title (VARCHAR)

announced_at (TIMESTAMP)

Notes

reference_id is stored here for easy public display.

This powers the winners history page.

---

# spin_rewards

Defines available daily spin rewards.

Columns

id (UUID, Primary Key)

reward_type (VARCHAR)

reward_amount (NUMERIC)

label (VARCHAR)

max_daily_winners (INTEGER)

is_active (BOOLEAN)

created_at (TIMESTAMP)

Reward Type Examples

cash  
free_entry  
none

Example Rows

cash | 1000 | ₦1000 Cash | 2 | true  
cash | 500 | ₦500 Cash | 3 | true  
cash | 100 | ₦100 Cash | 5 | true  
free_entry | 0 | Free Entry | 10 | true  
none | 0 | Try Again | 999999 | true

Notes

This table controls reward limits for the daily spin.

---

# spin_history

Stores each user's daily spin result.

Columns

id (UUID, Primary Key)

user_id (UUID, Foreign Key -> users.id)

reward_id (UUID, Foreign Key -> spin_rewards.id)

reward_amount (NUMERIC)

spin_cost (NUMERIC)

created_at (TIMESTAMP)

Notes

Used to:

Track spin outcomes  
Enforce one spin per day per user  
Record wallet deductions and rewards

Example

spin_cost: 15  
reward_amount: 500

---

# daily_quizzes

Stores daily quiz questions.

Columns

id (UUID, Primary Key)

question (TEXT)

option_a (VARCHAR)

option_b (VARCHAR)

option_c (VARCHAR)

option_d (VARCHAR)

correct_option (VARCHAR)

reward_amount (NUMERIC)

quiz_date (DATE, UNIQUE)

is_active (BOOLEAN)

created_at (TIMESTAMP)

Example

question: Who is the current President of Nigeria?  
option_a: Bola Tinubu  
option_b: Muhammadu Buhari  
option_c: Goodluck Jonathan  
option_d: Olusegun Obasanjo  
correct_option: A  
reward_amount: 50

Notes

There should only be one active quiz per day.

quiz_date should be unique so only one quiz exists for each date.

---

# quiz_attempts

Stores each user's daily quiz attempt.

Columns

id (UUID, Primary Key)

user_id (UUID, Foreign Key -> users.id)

quiz_id (UUID, Foreign Key -> daily_quizzes.id)

selected_option (VARCHAR)

is_correct (BOOLEAN)

reward_amount (NUMERIC)

attempted_at (TIMESTAMP)

Notes

Used to:

Track whether user answered correctly  
Prevent multiple quiz attempts in one day  
Track reward payout

Recommended Rule

Add a unique constraint on user_id + quiz_id

This ensures one attempt per user per quiz.

---

# Relationships Overview

users
 ├── wallets
 ├── wallet_transactions
 ├── entries
 ├── winners
 ├── spin_history
 └── quiz_attempts

draws
 ├── entries
 └── winners

spin_rewards
 └── spin_history

daily_quizzes
 └── quiz_attempts

---

# MVP Notes

This schema supports:

User registration  
Reference ID system  
Wallet funding and deductions  
Prize draw entries  
Winner history  
Daily spin rewards  
Daily quiz rewards

It is simple enough for MVP and flexible enough for future expansion.

---

# Possible Future Tables

referrals  
notifications  
admin_users  
withdrawal_requests  
promo_banners
