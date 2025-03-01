import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  // Get the current professor's session
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated and is a professor
  if (!session || session.user.role !== "professor") {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  try {
    // Fetch classes created by this professor
    const professorClasses = await prisma.class.findMany({
      where: { professorId: session.user.id }
    });

    return new Response(JSON.stringify(professorClasses), { status: 200 });
  } catch (error) {
    console.error("Error fetching professor's classes:", error);
    return new Response(JSON.stringify({ message: "Error fetching classes" }), { status: 500 });
  }
}
