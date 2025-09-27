import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export interface DemoData {
  organization: any;
  users: any[];
  customers: any[];
  appointments: any[];
  invoices: any[];
  messages: any[];
}

export async function createDemoData(): Promise<DemoData> {
  // Create demo organization
  const organization = await prisma.organization.create({
    data: {
      name: "Demo Service Company",
      plan: "demo",
      status: "active",
      settings: {
        timezone: "America/New_York",
        businessHours: {
          monday: { start: "09:00", end: "17:00" },
          tuesday: { start: "09:00", end: "17:00" },
          wednesday: { start: "09:00", end: "17:00" },
          thursday: { start: "09:00", end: "17:00" },
          friday: { start: "09:00", end: "17:00" },
          saturday: { start: "10:00", end: "14:00" },
          sunday: { closed: true }
        },
        theme: {
          primaryColor: "#3B82F6",
          secondaryColor: "#1E40AF",
          accentColor: "#F59E0B"
        }
      }
    }
  });

  // Create demo users
  const hashedPassword = await bcrypt.hash('demo123', 12);
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "demo@vervidflow.com",
        name: "Demo Admin",
        role: "ADMIN",
        organizationId: organization.id,
        emailVerified: new Date(),
        isDemo: true
      }
    }),
    prisma.user.create({
      data: {
        email: "manager@vervidflow.com",
        name: "Demo Manager",
        role: "MANAGER",
        organizationId: organization.id,
        emailVerified: new Date(),
        isDemo: true
      }
    }),
    prisma.user.create({
      data: {
        email: "technician@vervidflow.com",
        name: "Demo Technician",
        role: "USER",
        organizationId: organization.id,
        emailVerified: new Date(),
        isDemo: true
      }
    })
  ]);

  // Create demo customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        organizationId: organization.id,
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        phone: "+1 (555) 123-4567",
        address: "123 Oak Street, Springfield, IL 62701",
        status: "ACTIVE",
        customerType: "RESIDENTIAL",
        source: "REFERRAL",
        notes: "Preferred customer, always pays on time. Prefers morning appointments.",
        tags: ["VIP", "Referral"],
        preferences: {
          communication: "EMAIL",
          appointmentReminders: true,
          marketingEmails: false
        }
      }
    }),
    prisma.customer.create({
      data: {
        organizationId: organization.id,
        name: "Mike's Auto Shop",
        email: "mike@mikesautoshop.com",
        phone: "+1 (555) 234-5678",
        address: "456 Industrial Blvd, Springfield, IL 62702",
        status: "ACTIVE",
        customerType: "COMMERCIAL",
        source: "GOOGLE",
        notes: "Commercial account, net 30 payment terms. Emergency services available.",
        tags: ["Commercial", "Net30"],
        preferences: {
          communication: "PHONE",
          appointmentReminders: true,
          marketingEmails: true
        }
      }
    }),
    prisma.customer.create({
      data: {
        organizationId: organization.id,
        name: "Jennifer Martinez",
        email: "jen.martinez@email.com",
        phone: "+1 (555) 345-6789",
        address: "789 Elm Avenue, Springfield, IL 62703",
        status: "ACTIVE",
        customerType: "RESIDENTIAL",
        source: "WEBSITE",
        notes: "New customer, requires detailed explanations of services.",
        tags: ["New Customer"],
        preferences: {
          communication: "SMS",
          appointmentReminders: true,
          marketingEmails: true
        }
      }
    }),
    prisma.customer.create({
      data: {
        organizationId: organization.id,
        name: "Robert Chen",
        email: "r.chen@email.com",
        phone: "+1 (555) 456-7890",
        address: "321 Pine Street, Springfield, IL 62704",
        status: "ACTIVE",
        customerType: "RESIDENTIAL",
        source: "FACEBOOK",
        notes: "Eco-conscious customer, prefers green solutions.",
        tags: ["Eco-Friendly"],
        preferences: {
          communication: "EMAIL",
          appointmentReminders: true,
          marketingEmails: false
        }
      }
    }),
    prisma.customer.create({
      data: {
        organizationId: organization.id,
        name: "Downtown Office Complex",
        email: "maintenance@downtowncomplex.com",
        phone: "+1 (555) 567-8901",
        address: "555 Business Center Dr, Springfield, IL 62705",
        status: "ACTIVE",
        customerType: "COMMERCIAL",
        source: "REFERRAL",
        notes: "Large commercial account, multiple properties. Contact property manager first.",
        tags: ["Commercial", "Multi-Property"],
        preferences: {
          communication: "EMAIL",
          appointmentReminders: true,
          marketingEmails: false
        }
      }
    })
  ]);

  // Create demo appointments
  const now = new Date();
  const appointments = await Promise.all([
    prisma.appointment.create({
      data: {
        organizationId: organization.id,
        customerId: customers[0].id,
        title: "HVAC Maintenance",
        description: "Annual HVAC system maintenance and filter replacement",
        startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        endTime: new Date(now.getTime() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours
        status: "SCHEDULED",
        type: "MAINTENANCE",
        location: customers[0].address,
        assignedUserId: users[2].id, // Technician
        estimatedDuration: 120,
        price: 150.00,
        notes: "Bring replacement filters and cleaning equipment"
      }
    }),
    prisma.appointment.create({
      data: {
        organizationId: organization.id,
        customerId: customers[1].id,
        title: "Emergency Repair",
        description: "Urgent electrical issue - main panel replacement",
        startTime: new Date(now.getTime() + 4 * 60 * 60 * 1000), // 4 hours from now
        endTime: new Date(now.getTime() + 4 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours duration
        status: "CONFIRMED",
        type: "EMERGENCY",
        location: customers[1].address,
        assignedUserId: users[2].id,
        estimatedDuration: 240,
        price: 850.00,
        notes: "Priority job - customer has no power"
      }
    }),
    prisma.appointment.create({
      data: {
        organizationId: organization.id,
        customerId: customers[2].id,
        title: "Plumbing Installation",
        description: "Install new bathroom fixtures",
        startTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        endTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // 6 hours
        status: "SCHEDULED",
        type: "INSTALLATION",
        location: customers[2].address,
        assignedUserId: users[2].id,
        estimatedDuration: 360,
        price: 1200.00,
        notes: "Customer will provide fixtures, we provide labor and materials"
      }
    }),
    prisma.appointment.create({
      data: {
        organizationId: organization.id,
        customerId: customers[0].id,
        title: "Follow-up Inspection",
        description: "Check previous HVAC repair work",
        startTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        endTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hour
        status: "COMPLETED",
        type: "INSPECTION",
        location: customers[0].address,
        assignedUserId: users[2].id,
        estimatedDuration: 60,
        price: 75.00,
        notes: "Everything looks good, customer satisfied"
      }
    })
  ]);

  // Create demo invoices
  const invoices = await Promise.all([
    prisma.invoice.create({
      data: {
        organizationId: organization.id,
        customerId: customers[0].id,
        appointmentId: appointments[3].id,
        invoiceNumber: "INV-2024-001",
        amount: 75.00,
        tax: 6.75,
        total: 81.75,
        status: "PAID",
        dueDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        paidDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        description: "Follow-up inspection service",
        items: [
          {
            description: "Follow-up Inspection",
            quantity: 1,
            rate: 75.00,
            amount: 75.00
          }
        ]
      }
    }),
    prisma.invoice.create({
      data: {
        organizationId: organization.id,
        customerId: customers[1].id,
        invoiceNumber: "INV-2024-002",
        amount: 850.00,
        tax: 76.50,
        total: 926.50,
        status: "PENDING",
        dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // Net 30
        description: "Emergency electrical panel replacement",
        items: [
          {
            description: "Electrical Panel Replacement",
            quantity: 1,
            rate: 600.00,
            amount: 600.00
          },
          {
            description: "Emergency Service Fee",
            quantity: 1,
            rate: 150.00,
            amount: 150.00
          },
          {
            description: "Materials & Parts",
            quantity: 1,
            rate: 100.00,
            amount: 100.00
          }
        ]
      }
    }),
    prisma.invoice.create({
      data: {
        organizationId: organization.id,
        customerId: customers[4].id,
        invoiceNumber: "INV-2024-003",
        amount: 2400.00,
        tax: 216.00,
        total: 2616.00,
        status: "OVERDUE",
        dueDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days overdue
        description: "Monthly maintenance services",
        items: [
          {
            description: "Monthly Maintenance Contract",
            quantity: 1,
            rate: 2400.00,
            amount: 2400.00
          }
        ]
      }
    })
  ]);

  // Create demo messages
  const messages = await Promise.all([
    prisma.message.create({
      data: {
        organizationId: organization.id,
        customerId: customers[0].id,
        content: "Hi Sarah! Just confirming your HVAC maintenance appointment tomorrow at 10 AM. Our technician will bring all necessary equipment.",
        channel: "SMS",
        direction: "OUTBOUND",
        status: "SENT",
        isAutomated: true,
        templateCategory: "APPOINTMENT_REMINDER"
      }
    }),
    prisma.message.create({
      data: {
        organizationId: organization.id,
        customerId: customers[0].id,
        content: "Perfect! I'll be home. Thank you for the reminder.",
        channel: "SMS",
        direction: "INBOUND",
        status: "RECEIVED"
      }
    }),
    prisma.message.create({
      data: {
        organizationId: organization.id,
        customerId: customers[1].id,
        content: "Emergency service completed successfully. Your electrical panel has been fully replaced and tested. Invoice will be sent via email.",
        channel: "EMAIL",
        direction: "OUTBOUND",
        status: "DELIVERED",
        subject: "Emergency Service Completed - Mike's Auto Shop"
      }
    }),
    prisma.message.create({
      data: {
        organizationId: organization.id,
        customerId: customers[2].id,
        content: "Hi Jennifer! We're excited to help with your bathroom renovation. We'll be there Friday at 9 AM for the fixture installation.",
        channel: "SMS",
        direction: "OUTBOUND",
        status: "SENT",
        isAutomated: true,
        templateCategory: "APPOINTMENT_CONFIRMATION"
      }
    })
  ]);

  return {
    organization,
    users,
    customers,
    appointments,
    invoices,
    messages
  };
}

export async function getDemoAccount() {
  const demoUser = await prisma.user.findFirst({
    where: { 
      email: "demo@vervidflow.com",
      isDemo: true 
    },
    include: {
      organization: true
    }
  });

  if (!demoUser) {
    // Create demo data if it doesn't exist
    const demoData = await createDemoData();
    return demoData.users[0];
  }

  return demoUser;
}

export async function cleanupDemoData() {
  // Find all demo organizations
  const demoOrgs = await prisma.organization.findMany({
    where: { plan: "demo" }
  });

  for (const org of demoOrgs) {
    // Delete all related data
    await prisma.message.deleteMany({ where: { organizationId: org.id } });
    await prisma.invoice.deleteMany({ where: { organizationId: org.id } });
    await prisma.appointment.deleteMany({ where: { organizationId: org.id } });
    await prisma.customer.deleteMany({ where: { organizationId: org.id } });
    await prisma.user.deleteMany({ where: { organizationId: org.id } });
    await prisma.organization.delete({ where: { id: org.id } });
  }
}
