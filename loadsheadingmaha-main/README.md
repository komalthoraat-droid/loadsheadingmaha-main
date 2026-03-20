# ⚡ LoadShedding-Maha

### A Power Cut Reporting & Scheduling System for Maharashtra

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React-blue)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-green)](https://supabase.com/)

A comprehensive web application designed to help villagers report power outages (Light Gone), allow authorities to verify issues, and empower engineers to schedule and publish upcoming power cuts.

## Features

### 👤 User Side (Villagers)
*   **Report Light Problem**: Users can easily report power cuts by entering their Name, Mobile Number, Taluka (Substation), and specific Village.
*   **Photo Evidence**: Users can optionally upload a photo of the incident (e.g., a broken wire or damaged transformer), which is securely stored in Supabase Storage.
*   **Live Schedule View**: Users can view currently active and upcoming power cut schedules for their village directly on the homepage, with simple and clear terminology ("Light Gone (Power Cut)").

### 👮 Authority Side
*   **Verification Dashboard**: Approval authorities have a dedicated tab to view all submitted "Light Problem" reports.
*   **Actionable Insights**: Authorities can see reporter details, the described issue, and view uploaded photos.
*   **Status Management**: Single-click actions to mark a report as **Verified** or **Rejected**, which instantly updates the database.
*   **Engineer Approvals**: Authorities can also approve or reject incoming registrations from new engineers.

### 👷 Engineer Side
*   **Bulk Scheduling**: Engineers can create load shedding (power cut) schedules. A new multi-select interface allows them to apply a single schedule to **multiple villages simultaneously**, or even an entire Substation.
*   **Detailed Planning**: They can set specific start and end times, and provide a clear "Reason" (e.g., Maintenance work, Fault repair) that will be visible to the public.

## Tech Stack
*   **Frontend**: React (Vite), TypeScript, Tailwind CSS, shadcn-ui
*   **Backend & DB**: Supabase (PostgreSQL), Supabase Auth, Row Level Security (RLS)
*   **Storage**: Supabase Storage for photo uploads
*   **Routing**: React Router
*   **Icons**: Lucide React

## How to run this project

1.  **Clone the Repository**
    ```sh
    git clone <YOUR_GIT_URL>
    cd <YOUR_PROJECT_NAME>
    ```

2.  **Install Dependencies**
    ```sh
    npm install
    ```

3.  **Environment Variables**
    Ensure you have your `.env` configured with your Supabase credentials. Create a `.env` file in the root directory and add:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
    *You can find these details in your Supabase project settings under API.*

4.  **Run Development Server**
    Start the local server for development:
    ```sh
    npm run dev
    ```
    *The app will be available at `http://localhost:8080` (or another port specified in the terminal).*

5.  **Build for Production (Optional)**
    When you are ready to deploy:
    ```sh
    npm run build
    ```

## Database Schema Highlights
*   **`substations` & `villages`**: Relational mapping of areas.
*   **`engineers`**: Links `auth.users` to specific substations.
*   **`light_problems`**: Stores public user reports including `photo_url` and `status`. Utilizes RLS to allow anonymous inserts but restricts reads/updates to Authorities.
*   **`load_shedding_schedules`**: Stores planned power cuts. Includes a unique constraint on `(village_id, schedule_date)` allowing smooth upserts for bulk schedule creation.
## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

Maharashtra Power Authority - contact@example.com

Project Link: [https://github.com/your-username/loadsheading-maha](https://github.com/your-username/loadsheading-maha)
