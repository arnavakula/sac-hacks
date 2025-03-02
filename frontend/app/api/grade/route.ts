import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma
const prisma = new PrismaClient();

// Flask Grading Server URL
const FLASK_GRADING_URL = "http://localhost:5005/submit";

export async function POST(req: NextRequest) {
  try {
    const { submissionId, studentStructuredTextUrl, answerKeyStructuredTextUrl } = await req.json();

    if (!submissionId || !studentStructuredTextUrl || !answerKeyStructuredTextUrl) {
      return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
    }

    // Call Flask API for grading
    const gradingResponse = await fetch(FLASK_GRADING_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_url: studentStructuredTextUrl,
        professor_url: answerKeyStructuredTextUrl,
      }),
    });

    // return NextResponse.json({ gradingResponse }, { status: 200 });
    if (!gradingResponse.ok) {
      throw new Error("Flask grading server failed.");
    }

    // Extract graded data
    const gradedData = await gradingResponse.json();

    // // Ensure required fields exist
    // if (!gradedData.score || !gradedData.percentage || !gradedData.questions) {
    //   throw new Error("Invalid response from Flask grading server.");
    // }


    // Update the submission with the grading results
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: gradedData.score, // Total score
        feedback: `Final Score: ${gradedData.score}/${gradedData.possible} (${gradedData.percentage}%)`,
        gradingDetails: gradedData.questions, // Store detailed question-wise grading in JSON
      },
    });

    return NextResponse.json({ success: true, gradedData });

  } catch (error) {
    console.error("Error in grading process:", error);
    return NextResponse.json({ error: "Failed to process grading." }, { status: 500 });
  }
}
