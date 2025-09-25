import { NextRequest, NextResponse } from "next/server";
import { inngest } from "~/inngest/client";

export async function GET() {
  try {
    // Test if Inngest client is properly configured
    const clientInfo = {
      id: inngest.id,
      name: inngest.name,
      // Check if the client has the necessary properties
      hasEventKey: !!inngest.eventKey,
      hasSigningKey: !!inngest.signingKey,
    };

    return NextResponse.json({
      success: true,
      clientInfo,
      message: "Inngest client is properly configured"
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Inngest client configuration error"
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Send a test event
    const result = await inngest.send({
      name: "test-event",
      data: { message: "Test from debug endpoint" },
    });

    return NextResponse.json({
      success: true,
      result,
      message: "Test event sent successfully"
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Failed to send test event"
    }, { status: 500 });
  }
}
