import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { ok, err, unauthorized, serverError } from "@/lib/api";

const optionalString = z.string().nullable().optional();

function sanitizeUrl(val?: string | null) {
  if (!val || val.trim() === "") return null;
  const trimmed = val.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

const updateSchema = z.object({
  fullName: optionalString,
  photoUrl: optionalString,
  headline: optionalString,
  about: optionalString,
  location: optionalString,
  email: optionalString,
  phone: optionalString,
  githubUrl: optionalString.transform(sanitizeUrl),
  linkedinUrl: optionalString.transform(sanitizeUrl),
  websiteUrl: optionalString.transform(sanitizeUrl),
  twitterUrl: optionalString.transform(sanitizeUrl),
  otherLinks: optionalString,
  careerInterests: optionalString,
  techInterests: optionalString,
  currentFocus: optionalString,
  longTermGoals: optionalString,
  isPublic: z.boolean().optional(),
  biographies: optionalString,
}).passthrough();

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();

    let profile = await prisma.profile.findUnique({
      where: { userId: auth.id },
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: { userId: auth.id },
      });
    }

    return ok(profile);
  } catch (e) {
    return serverError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth) return unauthorized();

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return err("Validation failed", 400, parsed.error.flatten());
    }

    // Filter out keys not present on Profile model
    const {
      fullName,
      photoUrl,
      headline,
      about,
      location,
      email,
      phone,
      githubUrl,
      linkedinUrl,
      websiteUrl,
      twitterUrl,
      otherLinks,
      careerInterests,
      techInterests,
      currentFocus,
      longTermGoals,
      isPublic,
      biographies,
    } = parsed.data;

    const dataToSave = {
      fullName: fullName ?? null,
      photoUrl: photoUrl ?? null,
      headline: headline ?? null,
      about: about ?? null,
      location: location ?? null,
      email: email ?? null,
      phone: phone ?? null,
      githubUrl: githubUrl ?? null,
      linkedinUrl: linkedinUrl ?? null,
      websiteUrl: websiteUrl ?? null,
      twitterUrl: twitterUrl ?? null,
      otherLinks: otherLinks ?? null,
      careerInterests: careerInterests ?? null,
      techInterests: techInterests ?? null,
      currentFocus: currentFocus ?? null,
      longTermGoals: longTermGoals ?? null,
      ...(isPublic !== undefined ? { isPublic } : {}),
      biographies: biographies ?? null,
    };

    const profile = await prisma.profile.upsert({
      where: { userId: auth.id },
      update: dataToSave,
      create: { userId: auth.id, ...dataToSave },
    });

    return ok(profile);
  } catch (e) {
    return serverError(e);
  }
}
