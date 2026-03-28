import { NextResponse } from "next/server";
import twilio from "twilio";
import { cscLocations } from "@/lib/data/csc-locations";
import { findNearestLocation } from "@/lib/utils/haversine";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const rawWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || "+14155238886";
const twilioWhatsAppNumber = rawWhatsAppNumber.startsWith("whatsapp:")
  ? rawWhatsAppNumber
  : `whatsapp:${rawWhatsAppNumber}`;

// Hardcoded confirmation number
const CONFIRMATION_WHATSAPP = "+918767708514";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // ─── Action: Locate nearest CSC (no booking) ────────────────────────────
    if (!action || action === "locate") {
      const { lat, lng } = body;

      if (!lat || !lng) {
        return NextResponse.json(
          { error: "Latitude and longitude are required." },
          { status: 400 },
        );
      }

      const nearestCSC = findNearestLocation({ lat, lng }, cscLocations);

      if (!nearestCSC) {
        return NextResponse.json(
          { error: "Could not find nearest CSC." },
          { status: 500 },
        );
      }

      const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${nearestCSC.lat},${nearestCSC.lng}`;

      return NextResponse.json({
        success: true,
        csc: nearestCSC,
        googleMapsLink,
      });
    }

    // ─── Action: Book appointment (send user details via WhatsApp) ───────────
    if (action === "book") {
      const { userName, userPhone, schemeInterest, cscName, cscAddress } = body;

      if (!userName || !userPhone) {
        return NextResponse.json(
          { error: "Name and phone number are required." },
          { status: 400 },
        );
      }

      const message = [
        `📋 *New CSC Booking via SchemeSetu AI*`,
        ``,
        `👤 *Name:* ${userName}`,
        `📞 *Phone:* ${userPhone}`,
        `📌 *Scheme Interest:* ${schemeInterest || "General Enquiry"}`,
        ``,
        `🏢 *CSC Centre:* ${cscName || "Nearest CSC"}`,
        `📍 *Address:* ${cscAddress || "N/A"}`,
        ``,
        `⏰ *Booked at:* ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`,
      ].join("\n");

      // Send WhatsApp to the hardcoded confirmation number
      if (accountSid && accountSid.startsWith("AC") && authToken) {
        const client = twilio(accountSid, authToken);
        try {
          await client.messages.create({
            body: message,
            from: twilioWhatsAppNumber,
            to: `whatsapp:${CONFIRMATION_WHATSAPP}`,
          });
          if (process.env.NODE_ENV === "development")
            console.log(`WhatsApp booking sent to ${CONFIRMATION_WHATSAPP}`);
        } catch (err) {
          console.error("Failed to send WhatsApp booking message:", err);
        }
      } else {
        console.warn(
          "Twilio not configured (SID must start with AC). Booking logged:",
        );
        if (process.env.NODE_ENV === "development") console.log(message);
      }

      return NextResponse.json({
        success: true,
        message: "Booking confirmed! A WhatsApp confirmation has been sent.",
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'locate' or 'book'." },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
