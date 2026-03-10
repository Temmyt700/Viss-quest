# VissQuest Backend Architecture

Backend Stack

Node.js  
Express.js  
PostgreSQL (Neon)

---

# Core API Routes

## Auth Routes

POST /api/auth/register

POST /api/auth/login

GET /api/auth/profile

---

## Wallet Routes

GET /api/wallet

Returns wallet balance.

POST /api/wallet/fund-request

User submits wallet funding request.

POST /api/wallet/approve

Admin approves deposit.

GET /api/wallet/transactions

Returns wallet transaction history.

---

## Draw Routes

GET /api/draws

Returns active draws.

GET /api/draws/:id

Returns single draw details.

POST /api/draws/enter

User enters a draw.

Flow

Check wallet balance

Deduct entry fee

Create entry record

No quiz should be required before entering a draw.

---

## Winners Routes

GET /api/winners

Returns winners history.

POST /api/winners/select

Admin triggers winner selection.

Random entry is selected.

Winner saved to winners table.

---

## Spin Routes

GET /api/spin/status

Check if user already spun today.

POST /api/spin

Perform daily spin.

Flow

Check wallet balance

Deduct spin cost

Select reward

Add reward to wallet if applicable

Record spin history

---

## Daily Quiz Routes

GET /api/quiz/today

Returns the current daily quiz question.

POST /api/quiz/answer

User submits answer to today’s quiz.

Flow

Check if user has already answered today

Validate selected answer

If correct, reward wallet

Store quiz attempt

GET /api/quiz/history

Returns quiz participation history for the logged-in user.

---

## Admin Routes

POST /api/admin/draws/create

POST /api/admin/draws/update

POST /api/admin/draws/close

GET /api/admin/entries

GET /api/admin/deposits

POST /api/admin/deposits/approve

POST /api/admin/deposits/reject

POST /api/admin/quiz/create

Create daily quiz question.

GET /api/admin/quiz/all

Returns all quiz questions.

---

# Winner Selection Logic

Random winner selection

Steps

Get all entries for draw

Select random index

Return selected entry

Insert winner record

Mark draw as completed

---

# Daily Quiz Logic

Steps

Admin creates one quiz question for the day

User visits Daily Quiz page

User selects one answer

System checks correctness

If correct, system credits wallet reward

System records that the user has already answered for the day

User cannot answer more than once per day