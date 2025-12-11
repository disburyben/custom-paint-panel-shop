# Project TODO

## Completed Features
- [x] Basic homepage layout with roller door loader
- [x] Navigation menu
- [x] Services page
- [x] Gallery page with lightbox
- [x] About page
- [x] Contact page with Google Maps
- [x] Interactive Quote Wizard with multi-step form
- [x] Process Timeline on homepage
- [x] Full-stack upgrade (Server + Database + User auth)
- [x] Database schema for quote submissions and files
- [x] Backend API for quote submission with file upload
- [x] S3 file storage integration
- [x] Owner notifications for new quotes

## Admin Dashboard Features (In Progress)
- [x] Admin-only API procedures with role-based access control
- [x] Admin dashboard page with authentication check
- [x] Quote submissions table with sorting and filtering
- [x] Status badges and management (new, reviewed, quoted, accepted, declined, completed)
- [x] Detailed quote view modal with customer info
- [x] File gallery viewer for uploaded vehicle photos
- [x] Search functionality for quotes


## Password-Based Admin Authentication (Completed)
- [x] Admin password environment variable configuration
- [x] Admin login page with password form
- [x] Session-based authentication for admin access
- [x] Cookie management for persistent login
- [x] Logout functionality

## Email Confirmation System (Completed)
- [x] Email service configuration (SMTP or API)
- [x] Professional email template for quote confirmations
- [x] Send confirmation email on quote submission
- [x] Include quote reference number and details
- [x] Set response time expectations
- [x] Test email delivery

## Admin Email Notifications (Completed)
- [x] Admin notification email template
- [x] Configure admin email address
- [x] Send email to admin on new quote submission
- [x] Include all quote details and customer info
- [x] Add direct link to admin dashboard
- [x] Test admin email delivery

## Admin Access Button (Completed)
- [x] Add admin button to website footer
- [x] Style button to be subtle but accessible
- [x] Link button to admin login page

## Admin Login Issue (Completed)
- [x] Diagnose why admin dashboard doesn't load after login
- [x] Fix authentication flow and redirect (added cookie-parser middleware)
- [x] Test login and dashboard display

## Login Redirect Issue (Completed)
- [x] Diagnose why login button doesn't redirect to dashboard
- [x] Fix form submission and navigation
- [x] Test complete login flow
- [x] Create test quote submission to demonstrate dashboard

## Team Gallery Feature (Completed)
- [x] Database schema for team members (name, title, bio, headshot, specialty)
- [x] Database schema for team member portfolio items
- [x] Admin page for managing team members
- [x] Upload team member headshots
- [x] Add/edit/delete team members
- [x] Manage individual portfolio galleries for each team member
- [x] Update Gallery page with team showcase section
- [x] Click on team member to view their individual portfolio
- [x] Test complete team gallery workflow

## Footer Business Details Update (Completed)
- [x] Update phone number to 0466254055
- [x] Update email to admin@Casperspaintworks.com.au
- [x] Update address to 33 Ayfield Road, Para Hills West
- [x] Update business hours to Monday - Friday 8:30 AM - 4:30 PM

## Map Container Error Fix (Completed)
- [x] Investigate map container error on homepage
- [x] Fix Google Maps initialization to check for container existence
- [x] Added try-catch error handling and DOM ready delay
- [x] Test homepage to ensure no errors

## E-Commerce System (In Progress)
- [x] Stripe payment integration setup
- [x] Database schema for products (merchandise + gift certificates)
- [x] Database schema for orders and order items
- [x] Database schema for shopping cart
- [x] Database schema for gift certificates
- [x] Database helper functions for all e-commerce operations
- [ ] Shop page with Stripe Payment Links for merchandise
- [ ] Gift certificate purchase page with Stripe Payment Links
- [ ] Product display with images and descriptions
- [ ] Direct checkout via Stripe (no cart needed)
- [ ] Order tracking via Stripe Dashboard
