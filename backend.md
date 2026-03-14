# VissQuest Backend Overview

Tagline  
Take Chances, Get Lucky, Win Big – VissQuest!

---

# Project Purpose

VissQuest is an online prize draw platform where users fund a wallet and participate in scheduled draws for a chance to win prizes such as electronics or cash.

The system focuses on fairness, transparency, and daily engagement through additional features like Lucky Spin and Daily Quiz.

The backend will manage authentication, wallets, draws, entries, reward systems, and moderation tools.

---

# Backend Stack

The backend will be built using:

- Node.js
- Express.js
- TypeScript
- Better Auth (authentication)
- Drizzle ORM
- Neon PostgreSQL database
- Google OAuth
- Cloudinary (for uploaded images)

---

# Core System Roles

The platform has three user roles.

## User

A normal platform participant.

Users can:

- create accounts
- log in
- fund wallet
- upload payment proof
- enter prize draws
- spin the lucky wheel once per day
- answer daily quiz
- view personal dashboard
- see past winners

Users cannot manage the platform.

---

## Moderator

Moderators only verify wallet funding.

They can:

- view funding requests
- review payment proof
- approve funding
- reject funding

Moderators cannot:

- delete users
- ban users
- edit system settings
- manage draws
- select winners

They only confirm deposits.

---

## Admin

Admins control the entire platform.

Admins can:

- create prize draws
- manage prizes
- manage spin rewards
- manage quizzes
- manage users
- suspend or ban users
- adjust wallet balances if necessary
- select draw winners
- view analytics

Admins have full control.

---

# Reference ID System

Each user receives a unique **Reference ID**.

Example:

VQ001  
VQ024  
VQ135  

The Reference ID is used for:

- payment narration
- displaying winners
- identifying users without exposing private data

The system must ensure every user receives a unique ID automatically during registration.

---

# Wallet System

Every user has an internal wallet.

Wallet funds are used to:

- enter prize draws
- spin the lucky wheel

Users fund their wallet manually through bank transfer.

Funding flow:

1. user transfers money using their reference ID
2. user uploads payment screenshot
3. moderator reviews request
4. moderator approves or rejects
5. approved requests credit the wallet

Every wallet change should be recorded in a transaction history.

---

# Prize Draw System

Prize draws occur on fixed days to build anticipation.

Draw Days:

- Monday
- Wednesday
- Friday

Each draw contains **three prize items**.

Example prizes:

- Smartphone
- Laptop
- ₦50,000 Cash Prize

Each prize has:

- entry fee
- countdown timer
- hidden maximum participant limit

Users can enter a prize draw by paying the entry fee from their wallet.

Once the maximum entry limit is reached, the prize entry automatically closes.

---

# Draw Closing and Winner Selection

When a draw closes, the system selects **one winner per prize**.

The winner is chosen randomly from all entries.

Users with multiple entries should have higher probability of winning.

Winners are displayed publicly using their **Reference ID**.

Example:

Laptop Winner  
Reference ID: VQ024

---

# Daily Lucky Spin

The platform includes a daily engagement feature called Lucky Spin.

Rules:

- users can spin once per day
- spin costs ₦15
- rewards are randomly selected

Possible rewards include:

- ₦1000
- ₦500
- ₦100
- Free Entry
- Try Again

Each reward type has a daily winner limit to control payouts.

Example:

₦1000 → 2 winners per day  
₦500 → 3 winners per day  
₦100 → 5 winners per day  

The backend must track reward counts daily.

---

# Daily Quiz

Another engagement feature is the Daily Quiz.

Rules:

- one quiz question per day
- users can answer once per day
- correct answers reward small wallet credits

Example rewards:

₦50  
₦100  

The system must prevent multiple attempts per day.

---

# Draw and Reward Automation

Some platform processes should run automatically.

Examples include:

- activating scheduled draws
- closing expired draws
- resetting daily spin limits
- resetting quiz availability
- selecting winners after draw closure

These tasks can be handled using scheduled jobs such as cron jobs.

---

# Basic Backend Modules

The backend should be structured around major features.

Suggested modules:

- authentication
- users
- wallet
- funding verification
- prize draws
- draw entries
- lucky spin
- daily quiz
- winners history
- admin tools

Each module should contain its own routes, services, and controllers.

---

# Security Principles

The backend must enforce strict rules:

- wallet balances must never become negative
- every wallet change must be recorded
- users can spin only once per day
- users can answer quiz only once per day
- prize entry limits must never be exceeded
- moderators must only approve funding
- admin permissions must be restricted to admins only

Backend authorization must always be enforced regardless of frontend restrictions.

---

# Backend Philosophy

The VissQuest backend should focus on:

- fairness
- transparency
- accurate wallet accounting
- controlled reward distribution
- secure role permissions
- user privacy protection

The backend acts as the **trust engine of the platform** and must ensure all platform rules are strictly enforced.