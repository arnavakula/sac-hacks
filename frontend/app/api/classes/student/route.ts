import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "student") {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  try {
    const studentClasses = await prisma.class.findMany({
      where: {
        users: { some: { userId: session.user.id } },
      },
    });

    return new Response(JSON.stringify(studentClasses), { status: 200 });
  } catch (error) {
    console.error("Error fetching student classes:", error);
    return new Response(JSON.stringify({ message: "Error retrieving classes." }), { status: 500 });
  }
}
