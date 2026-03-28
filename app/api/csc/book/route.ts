import { NextResponse } from "next/server";
import twilio from "twilio";
import { cscLocations } from "@/lib/data/csc-locations";
import { findNearestLocation } from "@/lib/utils/haversine";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";

export async function POST(request: Request) {
  try {
    const { lat, lng } = await request.json();

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Latitude and longitude are required." },
        { status: 400 }
      );
    }

    const nearestCSC = findNearestLocation({ lat, lng }, cscLocations);

    if (!nearestCSC) {
      return NextResponse.json(
        { error: "Could not find nearest CSC." },
        { status: 500 }
      );
    }

    if (accountSid && accountSid.startsWith("AC") && authToken && nearestCSC.whatsapp) {
      const client = twilio(accountSid, authToken);
      try {
        await client.messages.create({
          body: "New Booking Request from SchemeSetu AI. Please assist.",
          from: twilioWhatsAppNumber,
          to: `whatsapp:${nearestCSC.whatsapp}`,
        });
        console.log(`WhatsApp message sent to ${nearestCSC.whatsapp}`);
      } catch (err) {
        console.error("Failed to send WhatsApp message via Twilio:", err);
      }
    } else {
        console.warn("Skipping Twilio WhatsApp message sending. TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not configured or CSC has no WhatsApp number.");
    }

    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${nearestCSC.lat},${nearestCSC.lng}`;

    return NextResponse.json({
      success: true,
      csc: nearestCSC,
      googleMapsLink,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
