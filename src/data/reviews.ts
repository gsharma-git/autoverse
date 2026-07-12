import type { Review } from "./types";

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

function r(
  dealerId: string,
  idx: number,
  customerName: string,
  rating: number,
  title: string,
  body: string,
  daysAgo: number,
  verified = true,
): Review {
  return {
    id: `${dealerId}-r${idx}`,
    dealerId,
    customerName,
    rating,
    title,
    body,
    createdAt: now - daysAgo * DAY,
    verified,
  };
}

export const reviews: Review[] = [
  // Supreme Tyres Mumbai
  r("d-supreme-mumbai", 1, "Rahul Mehta", 5, "Flawless fitting", "Booked a set of Michelins on WhatsApp, price matched online. Alignment done in 40 minutes. Highly recommended.", 12),
  r("d-supreme-mumbai", 2, "Priya Iyer", 5, "Best in Lower Parel", "Very professional team. Explained tread wear patiently and didn't upsell.", 34),
  r("d-supreme-mumbai", 3, "Arjun Kapoor", 4, "Great service, small wait", "Weekend was busy but quality of work was top notch. Nitrogen filling free.", 60),
  r("d-supreme-mumbai", 4, "Sneha Rao", 5, "Trusted for years", "Third set of tyres from Supreme. Never had a complaint.", 120),
  r("d-supreme-mumbai", 5, "Vikram Shah", 4, "Fair pricing", "Quote was ₹2000 less than a nearby competitor for the same Continentals.", 200, false),

  // AutoHub Prabhadevi
  r("d-autohub-mumbai", 1, "Neha Kulkarni", 5, "Loved the alloys", "Got Enkei RPF1 fitted, looks stunning on my Polo. Team is very knowledgeable.", 20),
  r("d-autohub-mumbai", 2, "Sameer Joshi", 4, "Fast fitting", "In and out in an hour with wheel balancing. Reception is a bit cramped.", 55),
  r("d-autohub-mumbai", 3, "Ritu Agarwal", 5, "Genuine advice", "They suggested rotating instead of replacing – saved me ₹18k. Rare honesty.", 90),
  r("d-autohub-mumbai", 4, "Karan Bedi", 4, "Good experience overall", "Happy with the Pirelli PZeros. Waiting area could use a coffee machine.", 150),

  // Tyre Empire HSR
  r("d-tyre-empire-blr", 1, "Meera Nair", 5, "HSR's best kept secret", "Excellent stock of MRF and Apollo. Alignment machine is a Hunter, so accurate.", 8),
  r("d-tyre-empire-blr", 2, "Aditya Reddy", 5, "Straight talkers", "No BS, priced fairly, done on time. This is my new go-to.", 30),
  r("d-tyre-empire-blr", 3, "Divya Prasad", 5, "Puncture repaired in 15 mins", "Walked in with a flat, walked out in 20 minutes. Cost me ₹150. Legends.", 45),
  r("d-tyre-empire-blr", 4, "Farhan Shaikh", 4, "Solid workshop", "Comprehensive service. Only wish they had covered parking.", 75),
  r("d-tyre-empire-blr", 5, "Ishaan Verma", 5, "20+ years for a reason", "My family has been coming here since the 90s. Still the same standards.", 210),
  r("d-tyre-empire-blr", 6, "Anita Menon", 4, "Well organised", "Digital invoicing, WhatsApp reminders for rotation. Modern setup.", 300),

  // Speedline Auto
  r("d-speedline-mumbai", 1, "Rohit Sinha", 5, "Alloys look brand new", "Got wheel refurb + coating done. Finish is showroom quality.", 25),
  r("d-speedline-mumbai", 2, "Tanvi Rane", 4, "Good weekend option", "Open on Sundays which was a lifesaver. Booked via WhatsApp.", 70),
  r("d-speedline-mumbai", 3, "Manish Gupta", 4, "Nice ambience", "Clean facility, professional team. Slightly on the pricier side.", 140),
  r("d-speedline-mumbai", 4, "Kavita Rao", 5, "Perfectly balanced", "No vibration at 120+ kmph after their balancing. Great job.", 40, false),

  // Wheel World Delhi
  r("d-wheel-world-delhi", 1, "Ankit Chauhan", 4, "Reliable local dealer", "Karol Bagh is chaotic but this place is well managed. Fair prices.", 18),
  r("d-wheel-world-delhi", 2, "Pooja Malhotra", 5, "Saved my road trip", "Blowout at 10pm, they stayed open to help me fit new tyres. Grateful.", 50),
  r("d-wheel-world-delhi", 3, "Suresh Yadav", 4, "Good CEAT stock", "Wide range of Ceat and MRF sizes. Owner is helpful.", 110),
  r("d-wheel-world-delhi", 4, "Nisha Bansal", 3, "Decent but crowded", "Work quality is fine but waiting time on weekends is long.", 65, false),

  // Highway Tyres Dwarka
  r("d-highway-delhi", 1, "Deepak Sharma", 5, "Great for Dwarka locals", "Quick alignment, nitrogen top-up free. Convenient location.", 22),
  r("d-highway-delhi", 2, "Ayesha Khan", 4, "Good stock of Goodyear", "Hard to find sizes were available in-store.", 80),
  r("d-highway-delhi", 3, "Varun Chopra", 5, "Honest workshop", "They refused to sell me tyres saying mine had 20% life left. Rare integrity.", 160),
  r("d-highway-delhi", 4, "Ritika Kaul", 4, "Efficient", "Wheel rotation done in 25 mins on a busy Saturday.", 40),

  // Grip Motors Chennai
  r("d-chennai-grip", 1, "Karthik Subramanian", 5, "Anna Nagar's finest", "Bought Apollo Alnac for my Baleno. Great grip in monsoon.", 15),
  r("d-chennai-grip", 2, "Lakshmi Iyer", 4, "Neat and clean", "Waiting area is comfortable. Coffee offered. Small touches matter.", 48),
  r("d-chennai-grip", 3, "Vishnu Ram", 5, "Puncture pros", "Fixed a sidewall issue that two others refused. Very skilled team.", 95),
  r("d-chennai-grip", 4, "Preethi Balaji", 4, "Recommended by friends", "Word of mouth is strong here. Lived up to the hype.", 175),

  // Torque Tyres Pune
  r("d-pune-torque", 1, "Aniket Deshpande", 5, "Perfect for enthusiasts", "They understand performance tyres. Fitted my PZeros on my Golf GTI with care.", 10),
  r("d-pune-torque", 2, "Sanika Patil", 5, "Late night savior", "Open till 9:30pm helped me a lot after work. Quick service.", 35),
  r("d-pune-torque", 3, "Harsh Vardhan", 4, "Good alloy selection", "HRE and Momo in stock — rare in Pune. Prices are premium but fair.", 70),
  r("d-pune-torque", 4, "Meghna Kale", 5, "Detail oriented", "They took photos before and after alignment. Very transparent.", 130),
  r("d-pune-torque", 5, "Rohan Bhosale", 4, "Solid experience", "Booking, quote, fitting, invoice — all smooth on WhatsApp.", 195, false),
];

export function reviewsForDealer(dealerId: string): Review[] {
  const matched = reviews.filter((rv) => rv.dealerId === dealerId);
  // If dealer ID matches mock data, return matched reviews.
  // Otherwise fall back to a consistent sample (first 5 from the pool).
  return matched.length > 0 ? matched : reviews.slice(0, 5).map((rv) => ({ ...rv, dealerId }));
}
