const db = require(rootPath + "/models");
const xlsx = require(rootPath + "/helpers/xlsx");
const { IMPORT_USER_PATH } = require(rootPath + "/helpers/constant");
const controller = require(rootPath + "/helpers/controller");
const { createPassword } = require(rootPath + "/helpers/hash");
const { getRoleAndDepartment } = require(rootPath + "/helpers/module");
const { validateData } = require(rootPath + "/helpers/validate");
const { getFormattedId } = require(rootPath + "/helpers/general");

/**
 * Imports users from the latest pending UserImportHistory record.
 * Validates each row, creates users, assigns roles/departments, and logs errors.
 */
exports.import = async function () {
  // Get the latest pending import file
  const result = await db.UserImportHistory.findOne({
    where: { status: "pending", isDeleted: "0" },
    raw: true,
    nest: true,
    order: [["createdAt", "DESC"]],
  });

  if (result === null) return;

  const { UIHNumber, fileName } = result;

  // Start a DB transaction
  const transaction = await db.sequelize.transaction();

  try {
    const filePath = IMPORT_USER_PATH + fileName;
    const users = xlsx.fileToJSON(filePath); // Convert Excel file to JSON
    const userArr = [];

    // Validation rules for each user entry
    const rules = {
      email: "required|email|uniqueUserEmail",
      password: "required",
      mobile: "required|uniqueUserMobile",
      role: "required",
      department: "required",
    };

    // Loop through each user row
    for (const user of users) {
      const isValid = await validateData(rules, user);

      // If validation fails, log error and continue
      if (isValid !== true) {
        await userError({ error: isValid, user, transaction, UIHNumber });
        continue;
      } else {
        // Get role and department IDs
        const roledepartment = await getRoleDepartment({
          user,
          transaction,
          UIHNumber,
        });

        if (roledepartment == false) continue;

        const { role, department } = roledepartment;
        const { name, email, mobile, password } = user;

        // Prepare user object for insertion
        const set = {
          name,
          email,
          mobile,
          password: await createPassword(password), // Hash the password
          department,
          role,
          verified: 1,
          imported: 1,
          UIHNumber,
        };

        // Insert user into DB
        let result = await db.User.create(set, { transaction });

        // Generate and update formatted user ID (e.g., USR0001)
        const userNumber = getFormattedId("USR", result.id);
        await db.User.update(
          { userNumber },
          { where: { id: result.id }, transaction }
        );

        userArr.push(set);
      }
    }

    // Update import status based on user insertion results
    await updateImportStatus({ users: userArr, transaction, UIHNumber });

    // Commit transaction
    await transaction.commit();
  } catch (err) {
    console.log(err);
    await transaction.rollback(); // Roll back transaction on failure
    await importError(UIHNumber); // Mark import as failed
  }
};

/**
 * Updates the UserImportHistory status to 'uploaded' if users were created,
 * or 'failed' if none succeeded.
 */
async function updateImportStatus({ users, transaction, UIHNumber }) {
  if (users.length > 0) {
    await db.UserImportHistory.update(
      { status: "uploaded" },
      {
        where: { UIHNumber },
        transaction,
      }
    );
    return true;
  } else {
    await db.UserImportHistory.update(
      { status: "failed" },
      {
        where: { UIHNumber },
        transaction,
      }
    );
    return false;
  }
}

/**
 * Logs a user import error entry with validation or role/department errors.
 */
async function userError({ error, user, transaction, UIHNumber }) {
  await db.UserImportError.create(
    {
      UIHNumber,
      errors: JSON.stringify(error),
      user: JSON.stringify(user),
    },
    { transaction }
  );
  return true;
}

/**
 * Updates the import history to mark the process as failed in case of exception.
 */
async function importError(UIHNumber) {
  try {
    await db.UserImportHistory.update(
      { status: "failed" },
      {
        where: { UIHNumber },
      }
    );
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Retrieves role and department IDs for the user.
 * If not found, logs the error and skips the user.
 */
async function getRoleDepartment({ user, transaction, UIHNumber }) {
  const { role: roleName, department: departmentName } = user;
  const result = await getRoleAndDepartment(roleName, departmentName);

  if (result == false) {
    const error = { error: "invalid role or department" };
    await userError({ error, user, transaction, UIHNumber });
    return false;
  }

  const { nagrcDepartmentId: department, nagrcRoleId: role } = result;
  return { department, role };
}
