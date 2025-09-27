import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createLanguageSchema = z.object({
  code: z.string().min(2, 'Language code must be at least 2 characters'),
  name: z.string().min(1, 'Language name is required'),
  nativeName: z.string().min(1, 'Native name is required'),
  isRTL: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    const where: any = {};
    if (isActive !== null) where.isActive = isActive === 'true';

    const languages = await prisma.language.findMany({
      where,
      include: {
        _count: {
          select: { 
            translations: true,
            organizations: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ languages });
  } catch (error) {
    console.error('Error fetching languages:', error);
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
    });

    // Only admins can create new languages
    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createLanguageSchema.parse(body);

    // Check if language code already exists
    const existingLanguage = await prisma.language.findUnique({
      where: { code: validatedData.code },
    });

    if (existingLanguage) {
      return NextResponse.json(
        { error: 'Language code already exists' },
        { status: 409 }
      );
    }

    const language = await prisma.language.create({
      data: validatedData,
      include: {
        _count: {
          select: { 
            translations: true,
            organizations: true,
          },
        },
      },
    });

    return NextResponse.json(language, { status: 201 });
  } catch (error) {
    console.error('Error creating language:', error);
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

// Seed default languages
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const defaultLanguages = [
      { code: 'en', name: 'English', nativeName: 'English', isRTL: false },
      { code: 'es', name: 'Spanish', nativeName: 'Español', isRTL: false },
      { code: 'fr', name: 'French', nativeName: 'Français', isRTL: false },
      { code: 'de', name: 'German', nativeName: 'Deutsch', isRTL: false },
      { code: 'it', name: 'Italian', nativeName: 'Italiano', isRTL: false },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português', isRTL: false },
      { code: 'zh', name: 'Chinese', nativeName: '中文', isRTL: false },
      { code: 'ja', name: 'Japanese', nativeName: '日本語', isRTL: false },
      { code: 'ko', name: 'Korean', nativeName: '한국어', isRTL: false },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRTL: true },
      { code: 'he', name: 'Hebrew', nativeName: 'עברית', isRTL: true },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', isRTL: false },
      { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', isRTL: false },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', isRTL: false },
      { code: 'haw', name: 'Hawaiian', nativeName: 'ʻŌlelo Hawaiʻi', isRTL: false },
      { code: 'th', name: 'Thai', nativeName: 'ไทย', isRTL: false },
      { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', isRTL: false },
      { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', isRTL: false },
      { code: 'tl', name: 'Filipino', nativeName: 'Filipino', isRTL: false },
      { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', isRTL: false },
    ];

    const createdLanguages = await Promise.all(
      defaultLanguages.map(langData =>
        prisma.language.upsert({
          where: { code: langData.code },
          create: langData,
          update: langData,
          include: {
            _count: {
              select: { 
                translations: true,
                organizations: true,
              },
            },
          },
        })
      )
    );

    return NextResponse.json({
      message: 'Default languages created successfully',
      languages: createdLanguages,
    });
  } catch (error) {
    console.error('Error creating default languages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
