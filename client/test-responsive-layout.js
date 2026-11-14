import fs from "fs";
import path from "path";
import assert from "assert";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("=== CLIENT RESPONSIVE LAYOUT & ACCESS CONTROL VERIFICATION ===");

let passed = 0;
let total = 0;

const runCheck = (title, condition, detail) => {
  total++;
  if (condition) {
    console.log(`  ✓ PASS: ${title}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${title}`);
    if (detail) console.error(`    Detail: ${detail}`);
    process.exit(1);
  }
};

const loginPath = path.join(__dirname, "src", "pages", "Login.jsx");
const registerPath = path.join(__dirname, "src", "pages", "Register.jsx");
const classesPath = path.join(__dirname, "src", "pages", "Classes.jsx");
const classCardPath = path.join(__dirname, "src", "components", "ClassCard.jsx");

const loginCode = fs.readFileSync(loginPath, "utf-8");
const registerCode = fs.readFileSync(registerPath, "utf-8");
const classesCode = fs.readFileSync(classesPath, "utf-8");
const classCardCode = fs.readFileSync(classCardPath, "utf-8");

// SECTION 1: LOGIN PAGE RESPONSIVE AUDIT
console.log("\n--- Section 1: Login.jsx Responsive Checks ---");

runCheck(
  "Outer container uses fluid horizontal padding (px-3 sm:px-6)",
  loginCode.includes("px-3 sm:px-6 py-6 sm:py-12"),
  "Expected outer container to reclaim padding on narrow viewports"
);

runCheck(
  "Card container uses compact mobile padding (p-4 sm:p-8 sm:p-10 rounded-2xl sm:rounded-3xl)",
  loginCode.includes("p-4 sm:p-8 sm:p-10") && loginCode.includes("rounded-2xl sm:rounded-3xl"),
  "Expected card container to use p-4 on 320px viewports"
);

runCheck(
  "Brand header h1 scales down to text-xl on mobile with break-words",
  loginCode.includes("text-xl sm:text-2xl sm:text-3xl") && loginCode.includes("break-words"),
  "Header text must scale to text-xl to prevent clipping down to 320px"
);

runCheck(
  "Toggle tabs contain whitespace-nowrap and responsive font size",
  loginCode.includes("whitespace-nowrap") && loginCode.includes("text-[11px] sm:text-xs"),
  "Toggle tabs must not break text into multiple lines at 320px"
);

runCheck(
  "1-Click Fast Fill header includes flex-wrap to prevent text collision",
  loginCode.includes("flex flex-wrap items-center justify-between text-[11px] text-slate-400 mb-2 gap-1"),
  "Demo section header must wrap flexibly below 380px"
);

runCheck(
  "1-Click Fast Fill grid reflows to 1 column below 380px (grid-cols-1 min-[380px]:grid-cols-2)",
  loginCode.includes("grid-cols-1 min-[380px]:grid-cols-2 gap-1.5"),
  "Fast fill demo accounts must stack into 1 column on narrow screens"
);

runCheck(
  "1-Click Fast Fill buttons contain truncate and full-width layout",
  loginCode.includes("truncate") && loginCode.includes("w-full flex items-center justify-start"),
  "Demo account buttons must not collide or overflow"
);

runCheck(
  "Email input placeholder is concise (name@example.com)",
  loginCode.includes('placeholder="name@example.com"'),
  "Email placeholder must avoid horizontal truncation on mobile"
);

// SECTION 2: REGISTER PAGE RESPONSIVE AUDIT
console.log("\n--- Section 2: Register.jsx Responsive Checks ---");

runCheck(
  "Outer container uses fluid horizontal padding (px-3 sm:px-6)",
  registerCode.includes("px-3 sm:px-6 py-6 sm:py-12"),
  "Register outer container must scale padding on narrow screens"
);

runCheck(
  "Card container uses compact mobile padding (p-4 sm:p-8 sm:p-10 rounded-2xl sm:rounded-3xl)",
  registerCode.includes("p-4 sm:p-8 sm:p-10") && registerCode.includes("rounded-2xl sm:rounded-3xl"),
  "Register card must use p-4 on 320px screens"
);

runCheck(
  "Brand header h1 scales down to text-xl with break-words",
  registerCode.includes("text-xl sm:text-2xl sm:text-3xl") && registerCode.includes("break-words"),
  "Register header must scale down fluidly"
);

runCheck(
  "Toggle tabs contain whitespace-nowrap and responsive font size",
  registerCode.includes("whitespace-nowrap") && registerCode.includes("text-[11px] sm:text-xs"),
  "Register toggle tabs must be non-colliding"
);

runCheck(
  "Membership tier selector reflows to 1 column below 420px (grid-cols-1 min-[420px]:grid-cols-2)",
  registerCode.includes("grid-cols-1 min-[420px]:grid-cols-2 gap-2"),
  "Tier selector must stack below 420px to prevent badge and title collisions"
);

runCheck(
  "Name placeholder is concise (e.g. Alexander Sterling)",
  registerCode.includes('placeholder="e.g. Alexander Sterling"'),
  "Full name placeholder must not be clipped"
);

// SECTION 3: ACCESS CONTROL AUDIT
console.log("\n--- Section 3: Frontend Access Control Checks ---");

runCheck(
  "Classes.jsx has guest access callout banner for non-member/inactive users",
  classesCode.includes("Guest Access Mode") && classesCode.includes("Activate Pass"),
  "Classes schedule must display a top warning banner for guests"
);

runCheck(
  "ClassCard.jsx incorporates 'Inactive' in isNonMember check",
  classCardCode.includes('user.membershipStatus === "Inactive"'),
  "ClassCard must treat Inactive status as non-member"
);

runCheck(
  "ClassCard.jsx replaces window.alert with disabled 'Admin View Only' button",
  classCardCode.includes("Admin View Only") && !classCardCode.includes('alert("Administrators cannot book member classes.")'),
  "Admin accounts must see a disabled button rather than trigger a browser alert"
);

runCheck(
  "ClassCard.jsx retains membership required prompt for guests",
  classCardCode.includes("🔒 Reserve (Membership Required)"),
  "Guests must see clear membership required prompt"
);

console.log(`\n======================================================`);
console.log(`SUMMARY: ${passed}/${total} RESPONSIVE ASSERTIONS PASSED!`);
console.log(`======================================================\n`);
