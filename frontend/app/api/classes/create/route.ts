import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "professor") {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  try {
    const { code, name, quarter, year, description, professorId } = await req.json();

    const newClass = await prisma.class.create({
      data: {
        code,
        name,
        quarter,
        year,
        description,
        professorId,
      },
    });

    return new Response(JSON.stringify(newClass), { status: 201 });
  } catch (error) {
    console.error("Error creating class:", error);
    return new Response(JSON.stringify({ message: "Error creating class.", error }), { status: 500 });
  }
}
