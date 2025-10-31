# BookIt - Highway Delite Experience Booking App

This project is my submission for the Highway Delite Full Stack Developer Internship assignment.

BookIt is a complete end-to-end web application where users can browse experiences, view available slots, apply promo codes, and confirm bookings.

---

## Live Project Links
(These will be updated after deployment)

Frontend: https://bookit-backend-jp3x.onrender.com 
Backend API: https://bookit-backend-jp3x.onrender.com 

---

## Features
- Browse and search for travel or leisure experiences.
- View available slots for each experience.
- Apply promo codes during checkout.
  - SAVE10 gives 10 percent off (for subtotal above 500)
  - FLAT100 gives flat 100 rupees off (for subtotal above 500)
- Prevents duplicate bookings for the same slot and email.
- Automatically reduces slot capacity after successful booking.
- Fully responsive for mobile, tablet, and desktop screens.

---

## Tech Stack

Frontend:
- React (Vite + TypeScript)
- Tailwind CSS
- Axios
- React Router DOM

Backend:
- Node.js and Express
- Prisma ORM
- PostgreSQL
- TypeScript

Deployment:
- Backend hosted on Render (with PostgreSQL)
- Frontend hosted on Vercel or Render Static Site

---

## How to Run Locally

1. Clone the Repository
```bash
git clone https://github.com/rohitkpatel7/bookit.git
cd bookit
Backend Setup

bash
Copy code
cd backend
cp .env.example .env
# Add your PostgreSQL DATABASE_URL inside .env

npm install
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
Backend will run on https://bookit-backend-jp3x.onrender.com

Frontend Setup

bash
Copy code
cd ../frontend
cp .env.example .env
# Set the API URL in .env file
VITE_API_URL=https://bookit-backend-jp3x.onrender.com

npm install
npm run dev
Frontend will run on https://bookit-lac-nu.vercel.app/

API Endpoints
Method	Endpoint	Description
GET	/experiences	Fetch all experiences
GET	/experiences/:id	Fetch single experience details with slots
POST	/promo/validate	Validate promo codes
POST	/bookings	Create a booking and update slot capacity

Notes
Booking and slot updates are handled inside a Prisma transaction for data consistency.

Duplicate bookings (same email and slot) are blocked using Prisma unique constraints.

Promo validation happens on both frontend and backend.

All pages are responsive and follow the design shared by Highway Delite.

Developer Information
Rohit Kumar Patel
B.Tech Electrical Engineering, Final Year
Email: kumarr072003@gmail.com , rkpatel07082003@gmail.com

