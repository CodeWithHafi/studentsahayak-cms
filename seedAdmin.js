const bcrypt = require("bcryptjs");
const db = require("./config/db");

async function createMasterAdmin() {
  try {
    // Find the CEO role ID
    const [roles] = await db.query(
      `SELECT id FROM roles WHERE role_name = 'CEO'`,
    );
    if (roles.length === 0) {
      console.log(
        "Error: Roles table is empty. Please insert roles via MySQL Workbench first.",
      );
      process.exit(1);
    }
    const ceoRoleId = roles[0].id;

    // Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Admin@123", salt);

    // Insert the master user
    await db.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role_id, department_id) 
             VALUES (?, ?, ?, ?, ?, ?)`,
      [
        "Super",
        "Admin",
        "admin@studentsahayak.online",
        hashedPassword,
        ceoRoleId,
        1,
      ],
    );

    console.log("Master Admin created successfully! You can now log in.");
    console.log("Email: admin@studentsahayak.online");
    console.log("Password: Admin@123");
    process.exit();
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      console.log("Admin user already exists in the database.");
    } else {
      console.error("Error creating admin:", error);
    }
    process.exit(1);
  }
}

createMasterAdmin();
