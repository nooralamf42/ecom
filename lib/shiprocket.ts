/**
 * Minimal Shiprocket API client. Auth token is fetched on demand and cached
 * in-memory for its ~10 day lifetime (re-fetched on expiry).
 */
export const shiprocketEnabled = Boolean(
  process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD,
);

const BASE = "https://apiv2.shiprocket.in/v1/external";

let cachedToken: { token: string; expires: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expires > Date.now()) return cachedToken.token;

  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Shiprocket auth failed (${res.status}). ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as { token: string };
  // Token valid ~10 days; cache for 9 to be safe.
  cachedToken = { token: data.token, expires: Date.now() + 9 * 24 * 60 * 60 * 1000 };
  return data.token;
}

export type ShiprocketOrderInput = {
  orderNumber: number;
  createdAt: Date;
  ship: {
    name: string;
    phone: string;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    pincode: string;
    email: string;
  };
  items: { name: string; sku: string; quantity: number; price: number }[]; // price in paise
  subtotalPaise: number;
};

export type ShiprocketOrderResult = {
  shiprocketOrderId?: string;
  shipmentId?: string;
  status?: string;
};

/** Create an order (adhoc) in Shiprocket. */
export async function createShiprocketOrder(
  input: ShiprocketOrderInput,
): Promise<ShiprocketOrderResult> {
  const token = await getToken();

  const payload = {
    order_id: String(input.orderNumber),
    order_date: input.createdAt.toISOString().slice(0, 10),
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
    billing_customer_name: input.ship.name,
    billing_last_name: "",
    billing_address: input.ship.line1,
    billing_address_2: input.ship.line2 || "",
    billing_city: input.ship.city,
    billing_pincode: input.ship.pincode,
    billing_state: input.ship.state,
    billing_country: "India",
    billing_email: input.ship.email,
    billing_phone: input.ship.phone,
    shipping_is_billing: true,
    order_items: input.items.map((i) => ({
      name: i.name,
      sku: i.sku,
      units: i.quantity,
      selling_price: Math.round(i.price / 100),
    })),
    payment_method: "Prepaid",
    sub_total: Math.round(input.subtotalPaise / 100),
    length: 15,
    breadth: 15,
    height: 15,
    weight: 0.5,
  };

  const res = await fetch(`${BASE}/orders/create/adhoc`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shiprocket order failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as {
    order_id?: number;
    shipment_id?: number;
    status?: string;
  };

  return {
    shiprocketOrderId: data.order_id ? String(data.order_id) : undefined,
    shipmentId: data.shipment_id ? String(data.shipment_id) : undefined,
    status: data.status,
  };
}

export type AwbResult = {
  awbCode?: string;
  courierName?: string;
};

/**
 * Auto-assign the best available courier and AWB number for a shipment.
 * Shiprocket picks the courier automatically when no `courier_id` is passed.
 */
export async function assignAwb(shipmentId: string): Promise<AwbResult> {
  const token = await getToken();

  const res = await fetch(`${BASE}/courier/assign/awb`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ shipment_id: Number(shipmentId) }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Shiprocket AWB assignment failed: ${res.status} ${text.slice(0, 200)}`);
  }

  let data: { response?: { data?: { awb_code?: string; courier_name?: string } } };
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Shiprocket AWB assignment returned invalid response: ${text.slice(0, 200)}`);
  }

  const awb = data.response?.data;
  if (!awb?.awb_code) {
    throw new Error(`Shiprocket AWB assignment did not return an AWB: ${text.slice(0, 200)}`);
  }

  return { awbCode: String(awb.awb_code), courierName: awb.courier_name };
}

/** Generate the printable shipping label PDF for an assigned shipment. */
export async function generateLabel(shipmentId: string): Promise<string> {
  const token = await getToken();

  const res = await fetch(`${BASE}/courier/generate/label`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ shipment_id: [Number(shipmentId)] }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Shiprocket label generation failed: ${res.status} ${text.slice(0, 200)}`);
  }

  let data: { label_created?: number; label_url?: string };
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Shiprocket label generation returned invalid response: ${text.slice(0, 200)}`);
  }

  if (!data.label_url) {
    throw new Error(`Shiprocket did not return a label URL: ${text.slice(0, 200)}`);
  }

  return data.label_url;
}

/** Shiprocket's public consumer tracking page for an AWB. */
export function trackingUrlFor(awbCode: string): string {
  return `https://shiprocket.co/tracking/${awbCode}`;
}

export type TrackingActivity = {
  date: string;
  status: string;
  location: string;
};

export type TrackingInfo = {
  currentStatus: string;
  pickupDate: string | null;
  deliveredDate: string | null;
  activities: TrackingActivity[];
};

/** Fetch real, live courier tracking status for an AWB. */
export async function trackShipment(awbCode: string): Promise<TrackingInfo> {
  const token = await getToken();

  const res = await fetch(`${BASE}/courier/track/awb/${awbCode}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Shiprocket tracking failed: ${res.status} ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    tracking_data?: {
      shipment_track?: {
        current_status?: string;
        pickup_date?: string;
        delivered_date?: string;
      }[];
      shipment_track_activities?: {
        date?: string;
        status?: string;
        activity?: string;
        location?: string;
      }[];
    };
  };

  const track = data.tracking_data?.shipment_track?.[0];
  const activities = data.tracking_data?.shipment_track_activities ?? [];

  return {
    currentStatus: track?.current_status ?? "",
    pickupDate: track?.pickup_date || null,
    deliveredDate: track?.delivered_date || null,
    activities: activities.map((a) => ({
      date: a.date ?? "",
      status: a.activity || a.status || "",
      location: a.location ?? "",
    })),
  };
}

/**
 * Cancel an order in Shiprocket (e.g. after a full refund before pickup).
 * Shiprocket rejects this once the shipment has been picked up.
 */
export async function cancelShiprocketOrder(shiprocketOrderId: string): Promise<void> {
  const token = await getToken();
  const res = await fetch(`${BASE}/orders/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ ids: [Number(shiprocketOrderId)] }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Shiprocket cancel failed: ${res.status} ${text.slice(0, 200)}`);
  }
}
