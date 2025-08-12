# QuickCourt - Sports Venue Booking Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.13.0-2D3748)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.11-38B2AC)](https://tailwindcss.com/)
[![NextAuth.js](https://img.shields.io/badge/NextAuth.js-5.0.0-purple)](https://next-auth.js.org/)

QuickCourt is a comprehensive sports venue booking platform that connects players with sports facilities. Built with modern web technologies, it provides seamless booking experiences for users, powerful management tools for venue owners, and robust administrative controls.

<h3 style="color:red;">Login Credentials For Demo Purpose</h3>

| Role   | Email                                   | Password       |
|--------|-----------------------------------------|----------------|
| Admin  | lakshay22csu100@ncuindia.edu            | Lakshay@123_   |
| Owner  | rishab22csu145@ncuindia.edu             | Rishab@123_    |
| User   | lakshaygoel911@gmail.com                | Lakshay@123_   |

 > ⚠️ **Note:** Please use a **work email** for demo purposes.  
> We are using **Postmark**, which accepts only work email addresses.

## Live Project Link 
[[Vercel Link](https://odoo-hackathon-virid.vercel.app/)]

## Demo Video Link
[[Drive Link](https://drive.google.com/file/d/1v4kTcUdPldwbeYeN-fsfsTArVgoQNR57/view?usp=sharing)]


## 🏆 Supported Sports

Our platform supports the following sports:

- **Swimming** - Pool facilities and aquatic centers
- **Tennis** - Indoor and outdoor tennis courts
- **Cricket** - Cricket grounds and nets
- **Football** - Football fields and pitches
- **Volleyball** - Indoor and beach volleyball courts
- **Basketball** - Indoor and outdoor basketball courts
- **Pickleball** - Dedicated pickleball courts
- **Badminton** - Indoor badminton courts
- **Table Tennis** - Table tennis facilities

## 🏆 Key Features

### 🎯 **Play Together Feature** 

An innovative social feature that allows players to create and join sports activities:

- **Create Invites**: Users can create sports activity invites specifying venue, date, time, sport, and required players
- **Join Activities**: Browse and join existing invites with customizable player count
- **Request Management**: Activity creators can accept/decline join requests with full visibility
- **Smart Availability**: Automatically updates available spots when requests are accepted
- **Real-time Updates**: Live notifications and status updates for all participants

### 👥 **User Management System**

- **Multi-role Authentication**: Players, venue owners, and administrators
- **Secure Registration**: Email/SMS OTP verification with bcrypt password hashing
- **Profile Management**: Comprehensive user profiles with booking history
- **Demo Accounts**: Pre-configured accounts for testing different user roles

### 🏟️ **Venue & Court Management**

- **Venue Registration**: Complete venue onboarding with image uploads via Cloudinary
- **Court Configuration**: Multiple sports support with custom pricing and availability
- **Approval Workflow**: Admin review process for new venue registrations
- **Availability Management**: Flexible scheduling with blocked time slots

### 📅 **Advanced Booking System**

- **Real-time Availability**: Dynamic slot checking with conflict prevention
- **Multiple Payment Options**: Integrated payment processing with deposit support
- **Booking Lifecycle**: Complete status tracking from pending to completion
- **Calendar Integration**: Intuitive date/time selection with visual availability

### 🔧 **Administrative Dashboard**

- **Platform Analytics**: Comprehensive statistics and growth metrics
- **User Management**: Ban/unban users, role management, verification status
- **Venue Approval**: Review and approve/reject venue registrations
- **System Monitoring**: Platform health metrics and performance tracking

### 🎨 **Modern UI/UX**

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Themes**: System-aware theme switching
- **Smooth Animations**: Framer Motion powered interactions
- **Accessible Components**: Radix UI based component library
- **Real-time Notifications**: Toast notifications with Sonner

## 🛠️ Technology Stack

### **Frontend**

- **Framework**: Next.js 15.4.6 with App Router
- **UI Library**: React 19.1.1 with TypeScript 5.7.0
- **Styling**: Tailwind CSS 4.1.11 with custom design system
- **Components**: Radix UI primitives with shadcn/ui
- **Animations**: Framer Motion for smooth interactions
- **State Management**: React Hook Form with Zod validation
- **Charts**: Recharts for analytics visualization

### **Backend**

- **API Routes**: Next.js API routes with TypeScript
- **Database**: SQLite with Prisma ORM 6.13.0
- **Authentication**: NextAuth.js 5.0 with JWT strategy
- **File Upload**: Cloudinary integration for image management
- **Email**: SendGrid and Nodemailer for transactional emails
- **Validation**: Zod schemas for type-safe validation

### **Development & Deployment**

- **Package Manager**: pnpm for efficient dependency management
- **Database Migrations**: Prisma migrations and schema management
- **Code Quality**: ESLint and TypeScript strict mode
- **Build Optimization**: Next.js optimizations with image optimization

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- SQLite (included with Prisma)
- Cloudinary account (for image uploads)
- SendGrid account (for emails)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd quicksport
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Environment Setup**
   Create `.env.local` file:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# SendGrid
SENDGRID_API_KEY="your-sendgrid-key"
```

4. **Database Setup**

```bash
npx prisma generate
npx prisma db push
```

5. **Start Development Server**

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📊 Database Schema

The application uses a comprehensive PostgreSQL database with the following main entities:

- **Users**: Multi-role user system (USER, OWNER, ADMIN)
- **Venues**: Sports facilities with location and amenities
- **Courts**: Individual playing areas with sport-specific configuration
- **Bookings**: Reservation system with payment tracking
- **Invites**: Play Together feature for social sports activities
- **Requests**: Join requests for sports activities

## 🧪 API Endpoints

### Authentication

- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/verify-otp` - OTP verification

### Venues & Courts

- `GET /api/venues` - List venues with filtering
- `POST /api/venues` - Create new venue (Owner)
- `GET /api/venues/[id]/courts` - Get venue courts

### Bookings

- `GET /api/bookings` - User bookings
- `POST /api/bookings` - Create booking
- `PATCH /api/bookings/[id]` - Update booking status

### Play Together Feature

- `GET /api/invites` - List all invites
- `POST /api/invites` - Create new invite
- `POST /api/invites/[id]/join` - Join invite request
- `GET /api/invites/[id]/requests` - Get join requests
- `PATCH /api/requests/[id]/accept` - Accept join request
- `PATCH /api/requests/[id]/decline` - Decline join request

### Admin

- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - User management
- `POST /api/admin/venues/approve` - Approve venues

## 🏗️ Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboards
│   ├── play-together/     # Social features
│   └── search/            # Venue search
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── play-together/    # Feature-specific components
│   └── navigation/       # Navigation components
├── lib/                  # Utilities and configurations
│   ├── auth.ts          # NextAuth configuration
│   ├── prisma.ts        # Database client
│   └── utils.ts         # Helper functions
├── prisma/              # Database schema and migrations
├── public/              # Static assets
└── types/               # TypeScript type definitions
```

## 👨‍💻 Contributors

This project was developed by a dedicated team during a hackathon focused on creating innovative sports booking solutions:

### Core Development Team

- Lakshay Goel - lakshaygoel911@gmail.com
- Kushal Girdhar - kushalgirdhar04@gmail.com
- Rishab Yadav - rishabyadav0811@gmail.com

## 📈 Features Roadmap

### Completed Features ✅

- Multi-role authentication system
- Venue and court management
- Advanced booking system
- **Play Together social feature**
- Admin dashboard with analytics
- Responsive design with dark/light themes

### Upcoming Features 🚀

- Mobile app development
- Payment gateway integration
- Advanced analytics and reporting
- SMS notifications
- Social features expansion
- Multi-language support
- Advanced search and filtering
- Booking recommendations AI

## 🔧 Technical Highlights

### Performance Optimizations

- Next.js 15 App Router for optimal performance
- Image optimization with Cloudinary
- Database query optimization with Prisma
- Lazy loading and code splitting
- Efficient state management

### Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with Zod
- SQL injection prevention
- XSS protection
- CSRF protection

### Accessibility

- WCAG 2.1 compliant components
- Keyboard navigation support
- Screen reader compatibility
- High contrast theme support
- Focus management

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for the utility-first CSS framework
- **Prisma Team** for the excellent ORM
- **Odoo** for providing the platform and opportunity for this hackathon project
- **Open Source Community** for the countless libraries that made this possible

## 📞 Support

For support and questions:

- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `/docs` folder

---

**Built with ❤️ during Odoo Hackathon using Next.js, React, TypeScript, and modern web technologies.**
