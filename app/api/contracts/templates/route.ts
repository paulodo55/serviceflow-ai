import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  variables: z.record(z.any()).optional(),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    });

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');

    const where: any = {
      organizationId: user.organization.id,
    };

    if (category) where.category = category;
    if (isActive !== null) where.isActive = isActive === 'true';

    const templates = await prisma.contractTemplate.findMany({
      where,
      include: {
        _count: {
          select: { contracts: true },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching contract templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    });

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = createTemplateSchema.parse(body);

    // If setting as default, unset other defaults
    if (validatedData.isDefault) {
      await prisma.contractTemplate.updateMany({
        where: {
          organizationId: user.organization.id,
          category: validatedData.category,
        },
        data: { isDefault: false },
      });
    }

    const template = await prisma.contractTemplate.create({
      data: {
        ...validatedData,
        organizationId: user.organization.id,
      },
      include: {
        _count: {
          select: { contracts: true },
        },
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating contract template:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues || [] },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Seed default templates
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    });

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const defaultTemplates = [
      {
        name: 'Service Agreement',
        description: 'Standard service agreement template',
        category: 'SERVICE',
        content: `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into on {{today}} between {{organization.name}} ("Provider") and {{customer.name}} ("Client").

1. SERVICES
Provider agrees to provide the following services:
[Describe services here]

2. PAYMENT TERMS
Client agrees to pay the agreed-upon fees as outlined in the attached schedule.

3. TERM
This agreement shall commence on the effective date and continue until terminated by either party with thirty (30) days written notice.

4. RESPONSIBILITIES
Provider Responsibilities:
- Deliver services as described
- Maintain professional standards
- Provide regular updates

Client Responsibilities:
- Provide necessary information
- Make timely payments
- Communicate requirements clearly

5. TERMINATION
Either party may terminate this agreement with written notice.

6. SIGNATURES
Provider: ___________________ Date: ___________
{{organization.name}}

Client: _____________________ Date: ___________
{{customer.name}}
{{customer.email}}
{{customer.phone}}`,
        variables: {
          'customer.name': 'Customer Name',
          'customer.email': 'Customer Email',
          'customer.phone': 'Customer Phone',
          'organization.name': 'Organization Name',
          'today': 'Current Date'
        },
        isActive: true,
        isDefault: true,
      },
      {
        name: 'Membership Agreement',
        description: 'Gym or club membership agreement',
        category: 'MEMBERSHIP',
        content: `MEMBERSHIP AGREEMENT

Member Information:
Name: {{customer.name}}
Email: {{customer.email}}
Phone: {{customer.phone}}
Address: {{customer.address}}

Membership Details:
Start Date: {{today}}
Membership Type: [Specify membership level]
Monthly Fee: $[Amount]

Terms and Conditions:
1. MEMBERSHIP FEES
   - Monthly fees are due on the 1st of each month
   - Late fees may apply after 10 days

2. FACILITY RULES
   - Members must follow all posted rules
   - Proper attire required at all times
   - Equipment must be returned after use

3. CANCELLATION
   - 30-day written notice required
   - No refunds for partial months

4. LIABILITY
   - Member assumes all risk of injury
   - Facility not responsible for personal property

Member Signature: _________________ Date: _________

{{organization.name}} Representative: _________________ Date: _________`,
        variables: {
          'customer.name': 'Member Name',
          'customer.email': 'Member Email',
          'customer.phone': 'Member Phone',
          'customer.address': 'Member Address',
          'organization.name': 'Organization Name',
          'today': 'Current Date'
        },
        isActive: true,
        isDefault: false,
      },
      {
        name: 'Software License Agreement',
        description: 'Software licensing and usage terms',
        category: 'SOFTWARE',
        content: `SOFTWARE LICENSE AGREEMENT

This Software License Agreement ("Agreement") is entered into between {{organization.name}} ("Licensor") and {{customer.name}} ("Licensee").

1. GRANT OF LICENSE
Licensor grants Licensee a non-exclusive, non-transferable license to use the software subject to the terms of this agreement.

2. PERMITTED USES
- Installation on authorized devices only
- Use for business purposes as intended
- Create backup copies for archival purposes

3. RESTRICTIONS
- No reverse engineering or decompiling
- No redistribution or resale
- No modification of source code

4. SUPPORT AND MAINTENANCE
- Technical support included for first year
- Updates provided at Licensor's discretion
- Additional support available for fee

5. PAYMENT TERMS
License Fee: $[Amount]
Payment Due: {{today}}
Renewal: [Annual/Monthly]

6. TERMINATION
License may be terminated for breach of terms or non-payment.

Licensor: {{organization.name}}
Signature: _________________ Date: _________

Licensee: {{customer.name}}
Signature: _________________ Date: _________`,
        variables: {
          'customer.name': 'Licensee Name',
          'customer.email': 'Licensee Email',
          'organization.name': 'Organization Name',
          'today': 'Current Date'
        },
        isActive: true,
        isDefault: false,
      }
    ];

    const createdTemplates = await Promise.all(
      defaultTemplates.map(template =>
        prisma.contractTemplate.upsert({
          where: {
            organizationId_name: {
              organizationId: user.organization.id,
              name: template.name,
            },
          },
          create: {
            ...template,
            organizationId: user.organization.id,
          },
          update: {
            ...template,
          },
          include: {
            _count: {
              select: { contracts: true },
            },
          },
        })
      )
    );

    return NextResponse.json({
      message: 'Default templates created successfully',
      templates: createdTemplates,
    });
  } catch (error) {
    console.error('Error creating default templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
