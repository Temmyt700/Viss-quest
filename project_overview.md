# VissQuest

Tagline  
Take Chances, Get Lucky, Win Big – VissQuest!

---

# Project Overview

VissQuest is an online prize draw platform where users can participate in scheduled prize draws for a chance to win cash or physical items.

Users enter draws by paying a small entry fee using their internal wallet balance.

Draws only occur on specific days to build anticipation and excitement.

Draw Days

Monday  
Wednesday  
Friday

Each draw contains three prize items.

Example prizes

Smartphone  
Laptop  
Cash Prize (₦50,000)

At the end of the draw period, the system randomly selects one winner for each prize.

Winners are displayed publicly using a unique Reference ID instead of their real name to protect user privacy.

---

# Core Features

## User Registration

Users create an account using:

Name  
Email  
WhatsApp Phone Number  
Password

Each user receives a unique reference ID.

Example

VQ001  
VQ002  
VQ003

This ID is used for:

Payment verification  
Winner display  
User identification

---

## User Dashboard

Each user has a personal dashboard showing:

Reference ID  
Wallet balance  
Total participations  
Total wins  
Entry history  
Daily spin access  
Daily quiz access

---

## Wallet System

Users must fund their wallet before entering draws or using spin-based features.

Funding Process

User clicks "Fund Wallet"

Bank transfer instructions are displayed

User transfers money and includes their reference ID in the narration.

Example

VQ024

User uploads payment screenshot.

Admin verifies payment and credits the wallet.

Example wallet balance

₦10,000

Entries and spins deduct from wallet balance automatically.

---

## Prize Draws

Each draw contains:

Prize image  
Prize title  
Entry fee  
Countdown timer

Example

Laptop Draw  
Entry Fee: ₦1000

Each draw has a hidden maximum participant limit.

When the limit is reached, the draw automatically closes.

Users see status messages such as:

Almost Filled  
Closing Soon  
Limited Slots Remaining

Users should be able to enter a draw directly without answering a quiz first.

---

## Daily Lucky Spin

Users can spin a lucky wheel once per day.

Spin Cost

₦15

Possible rewards

₦1000  
₦500  
₦100  
Free Entry  
Try Again

Each reward has a limited number of daily winners.

Example

₦1000 → 2 winners  
₦500 → 3 winners  
₦100 → 5 winners

This keeps payout controlled.

---

## Daily Quiz

The quiz is a separate daily engagement feature.

Users can visit the Daily Quiz page to answer one question per day and earn a small wallet reward if correct.

Example rewards

₦50  
₦100

Purpose

Increase daily engagement  
Encourage return visits  
Reward active users

The quiz is not part of the prize draw entry flow.

---

## Winner Selection

At draw closing time, the system randomly selects a winner from all entries.

Winners are displayed using their reference ID.

Example

Laptop Draw Winner  
Reference ID: VQ024

---

## Winners History

A public page shows previous winners.

Example

Laptop Winner  
VQ024  
March 12 2026

This builds trust and transparency.

---

## Tech Stack

Frontend

React

Backend

Node.js  
Express.js

Database

PostgreSQL (Neon)

Image Storage

Cloudinary

---

## MVP Goals

Launch a simple and reliable system that includes:

User accounts  
Wallet system  
Manual wallet funding  
Prize draws  
Daily spin  
Daily quiz  
Admin verification

The system should be lightweight, low-cost, and scalable as the platform grows.